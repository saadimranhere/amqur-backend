"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatOrchestrator = void 0;
const common_1 = require("@nestjs/common");
const intent_types_1 = require("./intents/intent.types");
const intent_detector_1 = require("./intents/intent.detector");
const inventory_engine_1 = require("./engines/inventory.engine");
const inventory_extractor_1 = require("./engines/inventory.extractor");
const appointment_extractor_1 = require("./appointment-extractor");
const vin_extractor_1 = require("./vin-extractor");
const vin_explainer_service_1 = require("./vin/vin-explainer.service");
const payment_extractor_1 = require("./payment-extractor");
const payment_service_1 = require("../payment/payment.service");
const vin_decoder_service_1 = require("./vin/vin-decoder.service");
const compare_extractor_1 = require("./compare-extractor");
const response_strategy_1 = require("./response-strategy");
const conversation_store_1 = require("./memory/conversation.store");
const crm_webhook_service_1 = require("./crm-webhook.service");
const lead_extractor_1 = require("./lead-extractor");
const date_normalizer_1 = require("./utils/date-normalizer");
const store_hours_1 = require("./utils/store-hours");
const time_utils_1 = require("./utils/time-utils");
const payment_explainer_1 = require("./payment-explainer");
const media_engine_1 = require("./media/media.engine");
const intelligent_router_1 = require("./intelligence/intelligent.router");
const intelligent_service_1 = require("./intelligence/intelligent.service");
const followup_engine_1 = require("./followup/followup.engine");
const lead_intelligence_1 = require("./lead-intelligence");
let ChatOrchestrator = class ChatOrchestrator {
    inventoryEngine;
    memory;
    appointmentExtractor;
    vinExtractor;
    vinDecoder;
    compareExtractor;
    crmWebhook;
    leadExtractor;
    paymentExplainer;
    mediaEngine;
    intelligentRouter;
    intelligentService;
    vinExplainer;
    followup;
    paymentService;
    constructor(inventoryEngine, memory, appointmentExtractor, vinExtractor, vinDecoder, compareExtractor, crmWebhook, leadExtractor, paymentExplainer, mediaEngine, intelligentRouter, intelligentService, vinExplainer, followup, paymentService) {
        this.inventoryEngine = inventoryEngine;
        this.memory = memory;
        this.appointmentExtractor = appointmentExtractor;
        this.vinExtractor = vinExtractor;
        this.vinDecoder = vinDecoder;
        this.compareExtractor = compareExtractor;
        this.crmWebhook = crmWebhook;
        this.leadExtractor = leadExtractor;
        this.paymentExplainer = paymentExplainer;
        this.mediaEngine = mediaEngine;
        this.intelligentRouter = intelligentRouter;
        this.intelligentService = intelligentService;
        this.vinExplainer = vinExplainer;
        this.followup = followup;
        this.paymentService = paymentService;
    }
    trackLeadEvent(userId, event) {
        const state = this.memory.getInventoryState(userId);
        const currentScore = state.leadScore ?? 0;
        const events = state.leadEvents ?? [];
        const newScore = (0, lead_intelligence_1.scoreLeadEvent)(currentScore, event);
        const newStage = (0, lead_intelligence_1.stageFromScore)(newScore);
        this.memory.setInventoryState(userId, {
            leadScore: newScore,
            leadStage: newStage,
            leadEvents: [...events, event],
        });
    }
    getLeadIntelligence(userId) {
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
    handleLeadCompletion(userId) {
        const state = this.memory.getInventoryState(userId);
        const lead = state.lead;
        if (!lead)
            return;
        if (lead.completed)
            return;
        if (this.memory.leadIsComplete(lead)) {
            this.memory.setLead(userId, { completed: true });
            this.trackLeadEvent(userId, 'lead_completed');
        }
    }
    async ensureLead(userId, message) {
        const extracted = this.leadExtractor.extract(message);
        if (extracted.firstName ||
            extracted.lastName ||
            extracted.phone ||
            extracted.email) {
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
        const missing = this.memory.missingLeadFields(state.lead);
        const stage = state.leadStage ?? 'cold';
        if (missing.includes('firstName')) {
            return {
                ok: false,
                reply: stage === 'hot'
                    ? 'Quick one — what’s your first name so I can lock this in?'
                    : 'What’s your first name?',
            };
        }
        return {
            ok: false,
            reply: stage === 'hot'
                ? 'Perfect — what’s the best phone number or email to reach you?'
                : 'What’s the best phone number or email to contact you?',
        };
    }
    shouldPromptLead(userId) {
        const state = this.memory.getInventoryState(userId);
        if (state.leadPrompted)
            return false;
        const stage = state.leadStage ?? 'cold';
        if (stage === 'hot')
            return true;
        const events = state.leadEvents ?? [];
        const triggers = [
            'payment',
            'payment_followup',
            'vehicle_view',
            'appointment',
            'hold',
        ];
        const triggerCount = events.filter(e => triggers.includes(e)).length;
        return triggerCount >= 2;
    }
    shouldSuggestTestDrive(userId) {
        const state = this.memory.getInventoryState(userId);
        if (state.testDriveSuggested)
            return false;
        if (!state.selectedVin)
            return false;
        const stage = state.leadStage ?? 'cold';
        if (stage === 'cold')
            return false;
        const events = state.leadEvents ?? [];
        const intentSignals = [
            'vehicle_view',
            'payment',
            'payment_followup',
            'compare',
        ];
        const signalCount = events.filter(e => intentSignals.includes(e)).length;
        return signalCount >= 2;
    }
    buildCrmPayload(params) {
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
    async handleMessage(input) {
        const { tenantId, userId, locationId } = input;
        const message = input.message ?? '';
        this.memory.setInventoryState(userId, {
            lastActivityAt: Date.now(),
        });
        const intent = intent_detector_1.IntentDetector.detect(message);
        const inventoryState = this.memory.getInventoryState(userId);
        if (intent === intent_types_1.ChatIntent.GENERAL_QUESTION &&
            inventoryState.visibleVins?.length) {
            return {
                reply: 'Would you like to view a vehicle, compare options, or see estimated monthly payments?',
            };
        }
        if (intent === intent_types_1.ChatIntent.GENERAL_QUESTION &&
            inventoryState?.visibleVins?.length) {
            return {
                reply: 'Would you like to view a vehicle, compare options, or see estimated monthly payments?',
            };
        }
        if (intent === intent_types_1.ChatIntent.INTELLIGENT_QUERY &&
            this.intelligentRouter.shouldRoute(intent)) {
            const reply = await this.intelligentService.answer({
                question: message,
                context: [],
            });
            return { reply };
        }
        const state = this.memory.getInventoryState(userId);
        const visibleVins = state.visibleVins ?? [];
        if (intent === intent_types_1.ChatIntent.HOLD_VEHICLE && state.selectedVin) {
            const gate = await this.ensureLead(userId, message);
            if (!gate.ok)
                return { reply: gate.reply };
            this.trackLeadEvent(userId, 'hold');
            await this.inventoryEngine.holdVehicle(tenantId, state.selectedVin);
            await this.crmWebhook.send(this.buildCrmPayload({
                tenantId,
                locationId,
                userId,
                intent: 'HOLD_VEHICLE',
                selected: {
                    vin: state.selectedVin,
                    status: 'HOLD',
                },
            }));
            return {
                reply: '✅ I’ve placed this vehicle on hold. A specialist will contact you shortly.',
            };
        }
        if (this.appointmentExtractor.wantsScheduling(message) ||
            state.appointment?.requested) {
            const gate = await this.ensureLead(userId, message);
            if (!gate.ok)
                return { reply: gate.reply };
            this.trackLeadEvent(userId, 'appointment');
            if (!state.appointment?.requested) {
                this.memory.setInventoryState(userId, {
                    appointment: { requested: true },
                });
                await this.crmWebhook.send(this.buildCrmPayload({
                    tenantId,
                    locationId,
                    userId,
                    intent: 'APPOINTMENT_REQUEST',
                    appointment: { requested: true },
                    selected: state.selectedVin
                        ? { vin: state.selectedVin, status: 'VIEWED' }
                        : undefined,
                }));
                return {
                    reply: 'I can schedule that — what day works best?',
                };
            }
            const rawDate = this.appointmentExtractor.extractDate(message);
            const date = rawDate
                ? (0, date_normalizer_1.normalizeDate)(rawDate)
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
                await this.crmWebhook.send(this.buildCrmPayload({
                    tenantId,
                    locationId,
                    userId,
                    intent: 'APPOINTMENT_DETAILS',
                    appointment: final.appointment,
                    selected: final.selectedVin
                        ? { vin: final.selectedVin, status: 'VIEWED' }
                        : undefined,
                }));
                if (final.appointment?.date && final.appointment?.time) {
                    const day = new Date(final.appointment.date).getDay();
                    const hours = store_hours_1.DEFAULT_STORE_HOURS[day];
                    if (!hours) {
                        return {
                            reply: 'We’re closed that day. Would another day work better?',
                        };
                    }
                    const mins = (0, time_utils_1.toMinutes)(final.appointment.time);
                    const open = (0, time_utils_1.toMinutes)(hours.open + ' AM');
                    const close = (0, time_utils_1.toMinutes)(hours.close + ' PM');
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
                    const appointment = confirmedState.appointment;
                    await this.crmWebhook.send(this.buildCrmPayload({
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
                    }));
                    return {
                        reply: `✅ You’re scheduled for ${appointment.date} at ${appointment.time}.`,
                    };
                }
                if (!final.appointment?.date) {
                    return { reply: 'What day works best for you?' };
                }
                if (!final.appointment?.time) {
                    return { reply: 'What time works best?' };
                }
            }
            if (!state.appointment?.date) {
                return { reply: 'What day works best for you?' };
            }
            if (!state.appointment?.time) {
                return { reply: 'What time works best?' };
            }
            return { reply: 'What day and time work best for you?' };
        }
        const selectedVin = this.vinExtractor.extract(message, visibleVins) ||
            inventoryState?.selectedVin;
        if (selectedVin) {
            this.trackLeadEvent(userId, 'vehicle_view');
            this.memory.setInventoryState(userId, { selectedVin });
            const vehicle = await this.inventoryEngine.getVehicleByVin(tenantId, selectedVin);
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
        if (intent === intent_types_1.ChatIntent.PAYMENT_ESTIMATE) {
            this.trackLeadEvent(userId, 'payment_followup');
            const payment = payment_extractor_1.PaymentExtractor.extract(message);
            this.memory.mergePayment(userId, payment);
            this.memory.mergePayment(userId, payment);
            const final = this.memory.getInventoryState(userId);
            if (!final.selectedVin) {
                return {
                    reply: 'Please select a vehicle first so I can calculate an accurate payment.',
                };
            }
            const vehicle = await this.inventoryEngine.getVehicleByVin(tenantId, final.selectedVin);
            if (!vehicle) {
                return {
                    reply: 'Sorry — this vehicle is no longer available. Would you like me to show similar options?',
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
            let reply = `Estimated payment is **$${formatted}/month**\n` +
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
        if (intent === intent_types_1.ChatIntent.INVENTORY_SEARCH) {
            this.trackLeadEvent(userId, 'inventory_search');
            const update = inventory_extractor_1.InventoryExtractor.extract(message);
            const payment = payment_extractor_1.PaymentExtractor.extract(message);
            this.memory.mergePayment(userId, payment);
            if (payment.maxMonthlyPayment ||
                payment.apr ||
                payment.termMonths ||
                payment.downPayment) {
                this.trackLeadEvent(userId, 'payment');
            }
            this.memory.setInventoryState(userId, update);
            this.memory.mergePayment(userId, payment);
            const criteria = this.memory.getInventoryState(userId);
            let vehicles = await this.inventoryEngine.searchVehicles({
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
                    const estimate = this.paymentService.estimateFinance({
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
                    .filter(v => (v.estimatedPayment ?? Infinity) <=
                    criteria.maxMonthlyPayment);
            }
            const enriched = await this.enrichVehiclesWithVin(vehicles);
            this.memory.setInventoryState(userId, {
                visibleVins: enriched.map(v => v.vin),
            });
            return {
                type: 'vehicle_carousel',
                vehicles: enriched,
                reply: (0, response_strategy_1.inventoryResponseByStage)(this.memory.getInventoryState(userId).leadStage ??
                    'cold'),
            };
        }
        if (this.followup.shouldFollowUp(state)) {
            return {
                reply: this.followup.buildMessage(state),
            };
        }
        return { reply: 'How can I help you today?' };
    }
    async enrichVehiclesWithVin(vehicles) {
        const enriched = [];
        for (const v of vehicles) {
            let profile = this.memory.getVinProfile(v.vin);
            if (!profile) {
                profile = await this.vinDecoder.decode(v.vin);
                this.memory.setVinProfile(v.vin, profile);
            }
            const media = await this.mediaEngine.enrich(v.make ?? '', v.vin);
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
};
exports.ChatOrchestrator = ChatOrchestrator;
exports.ChatOrchestrator = ChatOrchestrator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_engine_1.InventoryEngine,
        conversation_store_1.ConversationStore,
        appointment_extractor_1.AppointmentExtractor,
        vin_extractor_1.VinExtractor,
        vin_decoder_service_1.VinDecoderService,
        compare_extractor_1.CompareExtractor,
        crm_webhook_service_1.CrmWebhookService,
        lead_extractor_1.LeadExtractor,
        payment_explainer_1.PaymentExplainer,
        media_engine_1.MediaEngine,
        intelligent_router_1.IntelligentRouter,
        intelligent_service_1.IntelligentService,
        vin_explainer_service_1.VinExplainerService,
        followup_engine_1.FollowupEngine,
        payment_service_1.PaymentService])
], ChatOrchestrator);
//# sourceMappingURL=chat.orchestrator.js.map