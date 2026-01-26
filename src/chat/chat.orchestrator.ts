import { Injectable } from '@nestjs/common';

import { ChatIntent } from './intents/intent.types';
import { IntentDetector } from './intents/intent.detector';

import { InventoryEngine } from './engines/inventory.engine';
import { InventoryExtractor } from './engines/inventory.extractor';

import { AppointmentExtractor } from './appointment-extractor';
import { VinExtractor } from './vin-extractor';
import { VinExplainerService } from './vin/vin-explainer.service';

import { PaymentExtractor } from './payment-extractor';
import { PaymentService } from '../payment/payment.service';

import { VinDecoderService } from './vin/vin-decoder.service';
import { VinProfile } from './vin/vin.types';
import { CompareExtractor } from './compare-extractor';
import { inventoryResponseByStage } from './response-strategy';

import { ConversationStore } from './memory/conversation.store';
import { InventoryVehicle } from './types/vehicle.types';

import { CrmWebhookService } from './crm-webhook.service';
import { LeadExtractor } from './lead-extractor';
import { normalizeDate } from './utils/date-normalizer';
import { DEFAULT_STORE_HOURS } from './utils/store-hours';
import { toMinutes } from './utils/time-utils';
import { PaymentExplainer } from './payment-explainer';
import { MediaEngine } from './media/media.engine';
import { IntelligentRouter } from './intelligence/intelligent.router';
import { IntelligentService } from './intelligence/intelligent.service';
import { FollowupEngine } from './followup/followup.engine';

import { scoreLeadEvent, stageFromScore } from './lead-intelligence';

type ChatResponse =
    | { reply: string }
    | {
        type: 'vehicle_detail';
        vehicle: VinProfile;
        reply: string;
    }
    | {
        type: 'vehicle_carousel';
        vehicles: InventoryVehicle[];
        reply: string;
    }
    | {
        type: 'vehicle_compare';
        vehicles: InventoryVehicle[];
        reply: string;
    };

@Injectable()
export class ChatOrchestrator {
    constructor(
        private readonly inventoryEngine: InventoryEngine,
        private readonly memory: ConversationStore,
        private readonly appointmentExtractor: AppointmentExtractor,
        private readonly vinExtractor: VinExtractor,
        private readonly vinDecoder: VinDecoderService,
        private readonly compareExtractor: CompareExtractor,
        private readonly crmWebhook: CrmWebhookService,
        private readonly leadExtractor: LeadExtractor,
        private readonly paymentExplainer: PaymentExplainer,
        private readonly mediaEngine: MediaEngine,
        private readonly intelligentRouter: IntelligentRouter,
        private readonly intelligentService: IntelligentService,
        private readonly vinExplainer: VinExplainerService,
        private readonly followup: FollowupEngine,
        private readonly paymentService: PaymentService,
    ) { }

    // ─────────────────────────────
    // Lead intelligence scoring
    // ─────────────────────────────

    private trackLeadEvent(userId: string, event: string) {
        const state = this.memory.getInventoryState(userId);

        const currentScore = state.leadScore ?? 0;
        const events = state.leadEvents ?? [];

        const newScore = scoreLeadEvent(currentScore, event);
        const newStage = stageFromScore(newScore);

        this.memory.setInventoryState(userId, {
            leadScore: newScore,
            leadStage: newStage,
            leadEvents: [...events, event],
        });
    }

    private getLeadIntelligence(userId: string) {
        const s = this.memory.getInventoryState(userId);
        const events = s.leadEvents ?? [];

        return {
            score: s.leadScore ?? 0,
            stage: s.leadStage ?? 'cold',
            events,
            lastEvent: events.length
                ? events[events.length - 1]
                : undefined,
        };
    }

    // ─────────────────────────────
    // E5.5 — lead completion detector
    // ─────────────────────────────

    private handleLeadCompletion(userId: string) {
        const state = this.memory.getInventoryState(userId);
        const lead = state.lead;

        if (!lead) return;
        if (lead.completed) return;

        if (this.memory.leadIsComplete(lead)) {
            this.memory.setLead(userId, { completed: true });
            this.trackLeadEvent(userId, 'lead_completed');
        }
    }

    // ─────────────────────────────
    // Lead gate
    // ─────────────────────────────

    private async ensureLead(
        userId: string,
        message: string,
    ): Promise<{ ok: true } | { ok: false; reply: string }> {

        const extracted = this.leadExtractor.extract(message);

        if (
            extracted.firstName ||
            extracted.lastName ||
            extracted.phone ||
            extracted.email
        ) {
            this.memory.setLead(userId, extracted);
        }

        const state = this.memory.getInventoryState(userId);

        if (state.lead?.completed) {
            return { ok: true };
        }

        if (this.memory.leadIsComplete(state.lead)) {
            this.memory.setLead(userId, { completed: true });
            return { ok: true };
        }

        const missing =
            this.memory.missingLeadFields(state.lead);

        const stage = state.leadStage ?? 'cold';

        if (missing.includes('firstName')) {
            return {
                ok: false,
                reply:
                    stage === 'hot'
                        ? 'Quick one — what’s your first name so I can lock this in?'
                        : 'What’s your first name?',
            };
        }

        return {
            ok: false,
            reply:
                stage === 'hot'
                    ? 'Perfect — what’s the best phone number or email to reach you?'
                    : 'What’s the best phone number or email to contact you?',
        };
    }

    // ─────────────────────────────
    // Lead prompt logic (E3)
    // ─────────────────────────────
    private shouldPromptLead(userId: string): boolean {
        const state = this.memory.getInventoryState(userId);
        if (state.leadPrompted) return false;

        const stage = state.leadStage ?? 'cold';

        if (stage === 'hot') return true;

        const events = state.leadEvents ?? [];

        const triggers = [
            'payment',
            'payment_followup',
            'vehicle_view',
            'appointment',
            'hold',
        ];

        const triggerCount = events.filter(e =>
            triggers.includes(e),
        ).length;

        return triggerCount >= 2;
    }
    // ─────────────────────────────
    // Test-drive trigger logic (E4)
    // ─────────────────────────────
    private shouldSuggestTestDrive(userId: string): boolean {
        const state = this.memory.getInventoryState(userId);

        // never repeat
        if (state.testDriveSuggested) return false;

        // must have a selected vehicle
        if (!state.selectedVin) return false;

        const stage = state.leadStage ?? 'cold';
        if (stage === 'cold') return false;

        const events = state.leadEvents ?? [];

        const intentSignals = [
            'vehicle_view',
            'payment',
            'payment_followup',
            'compare',
        ];

        const signalCount = events.filter(e =>
            intentSignals.includes(e),
        ).length;

        return signalCount >= 2;
    }

    // ─────────────────────────────
    // CRM payload builder
    // ─────────────────────────────

    private buildCrmPayload(params: {
        tenantId: string;
        locationId?: string | null;
        userId: string;
        intent: string;
        selected?: { vin: string; status?: string };
        appointment?: any;
    }) {
        const final = this.memory.getInventoryState(params.userId);

        return {
            source: 'website-chatbot',
            tenantId: params.tenantId,
            locationId: params.locationId,
            timestamp: new Date().toISOString(),

            intent: params.intent,
            lead: final.lead,

            leadIntelligence: this.getLeadIntelligence(params.userId),

            selectedVehicle: params.selected,
            appointment: params.appointment,

            searchContext: {
                query: final.query,
                year: final.year,
                maxPrice: final.maxPrice,

                vehicle: final.selectedVin
                    ? { vin: final.selectedVin }
                    : undefined,

                payment: {
                    estimatedMonthly: final.lastEstimatedPayment,
                    maxMonthlyPayment: final.maxMonthlyPayment,
                    downPayment: final.downPayment,
                    termMonths: final.termMonths,
                    apr: final.apr,
                },

                filters: {
                    color: final.color,
                    drivetrain: final.drivetrain,
                    bodyType: final.bodyType,
                    sortBy: final.sortBy,
                },
            },

            conversationSummary: {
                leadStage: final.leadStage,
                leadScore: final.leadScore,
                events: final.leadEvents,
            },
        };

    }

    // ─────────────────────────────
    // Main handler
    // ─────────────────────────────

    async handleMessage(input: {
        message?: string;

        action?: string;
        vin?: string;
        conversationId?: string;
        role?: string;

        tenantId: string;
        userId: string;
        locationId?: string | null;
    }): Promise<ChatResponse> {

        const { tenantId, userId, locationId } = input;
        const message = input.message ?? '';

        this.memory.setInventoryState(userId, {
            lastActivityAt: Date.now(),
        });

        const intent = IntentDetector.detect(message);
        const inventoryState =
            this.memory.getInventoryState(userId);

        /**
         * Conversational continuation
         * Example:
         *  user: "yes"
         *  user: "ok"
         *  user: "show me more"
         */
        if (
            intent === ChatIntent.GENERAL_QUESTION &&
            inventoryState.visibleVins?.length
        ) {
            return {
                reply:
                    'Would you like to view a vehicle, compare options, or see estimated monthly payments?',
            };
        }
        // conversational continuation
        if (
            intent === ChatIntent.GENERAL_QUESTION &&
            inventoryState?.visibleVins?.length
        ) {
            return {
                reply:
                    'Would you like to view a vehicle, compare options, or see estimated monthly payments?',
            };
        }

        // 🧠 Intelligent Mode routing
        if (
            intent === ChatIntent.INTELLIGENT_QUERY &&
            this.intelligentRouter.shouldRoute(intent)
        ) {
            const reply = await this.intelligentService.answer({
                question: message,
                context: [],
            });

            return { reply };
        }
        const state = this.memory.getInventoryState(userId);
        const visibleVins = state.visibleVins ?? [];

        // HOLD VEHICLE
        if (intent === ChatIntent.HOLD_VEHICLE && state.selectedVin) {
            const gate = await this.ensureLead(userId, message);
            if (!gate.ok) return { reply: gate.reply };

            this.trackLeadEvent(userId, 'hold');

            await this.inventoryEngine.holdVehicle(
                tenantId,
                state.selectedVin,
            );

            await this.crmWebhook.send(
                this.buildCrmPayload({
                    tenantId,
                    locationId,
                    userId,
                    intent: 'HOLD_VEHICLE',
                    selected: {
                        vin: state.selectedVin,
                        status: 'HOLD',
                    },
                }),
            );

            return {
                reply:
                    '✅ I’ve placed this vehicle on hold. A specialist will contact you shortly.',
            };
        }

        // ─────────────────────────────
        // APPOINTMENT FLOW (E6)
        // ─────────────────────────────
        if (
            this.appointmentExtractor.wantsScheduling(message) ||
            state.appointment?.requested
        ) {
            const gate = await this.ensureLead(userId, message);
            if (!gate.ok) return { reply: gate.reply };

            this.trackLeadEvent(userId, 'appointment');

            // ensure appointment flow started
            if (!state.appointment?.requested) {
                this.memory.setInventoryState(userId, {
                    appointment: { requested: true },
                });

                await this.crmWebhook.send(
                    this.buildCrmPayload({
                        tenantId,
                        locationId,
                        userId,
                        intent: 'APPOINTMENT_REQUEST',
                        appointment: { requested: true },
                        selected: state.selectedVin
                            ? { vin: state.selectedVin, status: 'VIEWED' }
                            : undefined,
                    }),
                );

                return {
                    reply: 'I can schedule that — what day works best?',
                };
            }

            // extract date/time
            const rawDate = this.appointmentExtractor.extractDate(message);
            const date = rawDate
                ? normalizeDate(rawDate)
                : undefined;
            const time = this.appointmentExtractor.extractTime(message);

            if (date || time) {
                this.memory.setInventoryState(userId, {
                    appointment: {
                        ...state.appointment,
                        ...(date ? { date } : {}),
                        ...(time ? { time } : {}),
                    },
                });

                const final = this.memory.getInventoryState(userId);

                await this.crmWebhook.send(
                    this.buildCrmPayload({
                        tenantId,
                        locationId,
                        userId,
                        intent: 'APPOINTMENT_DETAILS',
                        appointment: final.appointment,
                        selected: final.selectedVin
                            ? { vin: final.selectedVin, status: 'VIEWED' }
                            : undefined,
                    }),
                );

                // confirm appointment when complete
                if (final.appointment?.date && final.appointment?.time) {
                    const day = new Date(final.appointment.date).getDay();
                    const hours = DEFAULT_STORE_HOURS[day];

                    // closed day
                    if (!hours) {
                        return {
                            reply:
                                'We’re closed that day. Would another day work better?',
                        };
                    }

                    const mins = toMinutes(final.appointment.time);
                    const open = toMinutes(hours.open + ' AM');
                    const close = toMinutes(hours.close + ' PM');

                    if (mins < open || mins > close) {
                        return {
                            reply: `We’re open from ${hours.open}–${hours.close}. Would an earlier time work?`,
                        };
                    }

                    this.memory.setInventoryState(userId, {
                        appointment: {
                            ...final.appointment,
                            confirmed: true,
                        },
                    });

                    const confirmedState = this.memory.getInventoryState(userId);
                    const appointment = confirmedState.appointment!;

                    await this.crmWebhook.send(
                        this.buildCrmPayload({
                            tenantId,
                            locationId,
                            userId,
                            intent: 'APPOINTMENT_CONFIRMED',
                            appointment,
                            selected: confirmedState.selectedVin
                                ? {
                                    vin: confirmedState.selectedVin,
                                    status: 'VIEWED',
                                }
                                : undefined,
                        }),
                    );

                    return {
                        reply: `✅ You’re scheduled for ${appointment.date} at ${appointment.time}.`,
                    };

                }


                // ask what's missing
                if (!final.appointment?.date) {
                    return { reply: 'What day works best for you?' };
                }

                if (!final.appointment?.time) {
                    return { reply: 'What time works best?' };
                }
            }

            // still missing info
            if (!state.appointment?.date) {
                return { reply: 'What day works best for you?' };
            }

            if (!state.appointment?.time) {
                return { reply: 'What time works best?' };
            }

            return { reply: 'What day and time work best for you?' };
        }


        // VIN VIEW
        const selectedVin =
            this.vinExtractor.extract(
                message,
                visibleVins,
            ) ||
            inventoryState?.selectedVin;


        if (selectedVin) {
            this.trackLeadEvent(userId, 'vehicle_view');
            this.memory.setInventoryState(userId, { selectedVin });

            const vehicle =
                await this.inventoryEngine.getVehicleByVin(
                    tenantId,
                    selectedVin,
                );

            if (!vehicle) {
                return {
                    reply: 'Sorry — I couldn’t find that vehicle.',
                };
            }

            this.trackLeadEvent(userId, 'vehicle_view');

            return {
                type: 'vehicle_carousel',
                reply: 'Here are the details for this vehicle:',
                vehicles: [vehicle],
            };


        }
        // ─────────────────────────────
        // PAYMENT ESTIMATE (E1)
        // ─────────────────────────────
        if (intent === ChatIntent.PAYMENT_ESTIMATE) {
            this.trackLeadEvent(userId, 'payment_followup');

            const payment = PaymentExtractor.extract(message);
            this.memory.mergePayment(userId, payment);
            // merge payment preferences safely
            this.memory.mergePayment(userId, payment);


            const final = this.memory.getInventoryState(userId);

            if (!final.selectedVin) {
                return {
                    reply:
                        'Please select a vehicle first so I can calculate an accurate payment.',
                };
            }

            const vehicle = await this.inventoryEngine.getVehicleByVin(
                tenantId,
                final.selectedVin,
            );
            if (!vehicle) {
                return {
                    reply:
                        'Sorry — this vehicle is no longer available. Would you like me to show similar options?',
                };
            }

            const estimate = this.paymentService.estimateFinance({
                price: Number(vehicle.price ?? 0),
                downPayment: final.downPayment,
                apr: final.apr ?? 9.99,
                termMonths: final.termMonths ?? 72,
            });

            const formatted = estimate.monthlyPayment.toLocaleString();
            this.memory.setInventoryState(userId, {
                lastEstimatedPayment: estimate.monthlyPayment,
            });

            let reply =
                `Estimated payment is **$${formatted}/month**\n` +
                `${estimate.breakdown.termMonths} months · ` +
                `$${final.downPayment || 0} down · ` +
                `${estimate.breakdown.apr}% APR\n\n` +
                `(Estimate only — taxes and fees included.)`;


            if (this.shouldPromptLead(userId)) {
                this.memory.setInventoryState(userId, {
                    leadPrompted: true,
                });

                reply +=
                    '\n\nWould you like me to send this info to you or have a specialist reach out?';
            }
            if (this.shouldSuggestTestDrive(userId)) {
                this.memory.setInventoryState(userId, {
                    testDriveSuggested: true,
                });

                reply +=
                    '\n\nWould you like to schedule a test drive for this vehicle?';
            }

            return { reply };

        }
        // INVENTORY SEARCH
        if (intent === ChatIntent.INVENTORY_SEARCH) {
            this.trackLeadEvent(userId, 'inventory_search');

            const update = InventoryExtractor.extract(message);
            const payment = PaymentExtractor.extract(message);
            this.memory.mergePayment(userId, payment);
            if (
                payment.maxMonthlyPayment ||
                payment.apr ||
                payment.termMonths ||
                payment.downPayment
            ) {
                this.trackLeadEvent(userId, 'payment');
            }


            // inventory filters
            this.memory.setInventoryState(userId, update);

            // payment preferences (merged safely)
            this.memory.mergePayment(userId, payment);


            const criteria = this.memory.getInventoryState(userId);

            let vehicles =
                await this.inventoryEngine.searchVehicles({
                    tenantId,
                    locationId,
                    ...criteria,
                });
            console.log('SEARCH CRITERIA:', {
                tenantId,
                locationId,
                ...criteria,
            });

            console.log('VEHICLES FOUND:', vehicles.length, vehicles);


            if (criteria.maxMonthlyPayment) {
                vehicles = vehicles
                    .map(v => {
                        const estimate =
                            this.paymentService.estimateFinance({
                                price: Number(v.price ?? 0),
                                downPayment: criteria.downPayment,
                                apr: criteria.apr ?? 9.99,
                                termMonths: criteria.termMonths ?? 72,
                            });


                        return {
                            ...v,
                            estimatedPayment: estimate.monthlyPayment,
                            paymentExplanation: this.paymentExplainer.explain({
                                price: Number(v.price ?? 0),
                                estimatedPayment: estimate.monthlyPayment,
                                downPayment: criteria.downPayment,
                                apr: estimate.breakdown.apr,
                                termMonths: estimate.breakdown.termMonths,
                            }),
                        };
                    })
                    .filter(
                        v =>
                            (v.estimatedPayment ?? Infinity) <=
                            criteria.maxMonthlyPayment!,
                    );
            }



            const enriched =
                await this.enrichVehiclesWithVin(vehicles);

            this.memory.setInventoryState(userId, {
                visibleVins: enriched.map(v => v.vin),
            });

            return {
                type: 'vehicle_carousel',
                vehicles: enriched,
                reply: inventoryResponseByStage(
                    this.memory.getInventoryState(userId).leadStage ??
                    'cold',
                ),
            };

        }
        if (this.followup.shouldFollowUp(state)) {
            return {
                reply: this.followup.buildMessage(state),
            };
        }
        return { reply: 'How can I help you today?' };
    }

    private async enrichVehiclesWithVin(
        vehicles: InventoryVehicle[],
    ): Promise<InventoryVehicle[]> {
        const enriched: InventoryVehicle[] = [];

        for (const v of vehicles) {
            let profile = this.memory.getVinProfile(v.vin);

            if (!profile) {
                profile = await this.vinDecoder.decode(v.vin);
                this.memory.setVinProfile(v.vin, profile);
            }

            const media = await this.mediaEngine.enrich(
                v.make ?? '',
                v.vin,
            );

            enriched.push({
                ...v,
                trim: v.trim ?? profile.trim,
                engine: profile.engine,
                drivetrain: profile.drivetrain,
                fuelType: profile.fuelType,
                doors: profile.doors,
                bodyType: profile.bodyType,

                photos: media.photos,
                windowStickerUrl: media.windowStickerUrl,
            });

        }

        return enriched;
    }
}
