import { Injectable } from '@nestjs/common';
import { VinProfile } from '../vin/vin.types';
import { InventoryUpdate } from '../engines/inventory.extractor';
import { applyInventoryUpdate } from './inventory.merge';
import { PaymentPreferences } from '../payment/payment.types';

/* ─────────────────────────────────────────────
   Lead & Appointment State
───────────────────────────────────────────── */

export type LeadState = {
    requested?: boolean;

    firstName?: string;
    lastName?: string;

    phone?: string;
    email?: string;

    preferredContact?: 'phone' | 'email';
    consentToText?: boolean;

    completed?: boolean;
};

export type AppointmentState = {
    requested?: boolean;
    date?: string;
    time?: string;
    confirmed?: boolean;
};

/* ─────────────────────────────────────────────
   Inventory Conversation State
───────────────────────────────────────────── */

export type ConversationInventoryState = {
    query?: string;
    year?: number;
    maxPrice?: number;

    // 💳 payment intelligence
    maxMonthlyPayment?: number;
    downPayment?: number;
    termMonths?: number;
    apr?: number;
    lastEstimatedPayment?: number;

    // VIN intelligence
    visibleVins?: string[];
    selectedVin?: string;
    compareVins?: string[];

    // filters
    color?: string;
    drivetrain?: string;
    bodyType?: string;
    sortBy?: 'price_asc' | 'price_desc';

    // flows
    lead?: LeadState;
    appointment?: AppointmentState;

    // lead intelligence
    leadScore?: number;
    leadStage?: 'cold' | 'warm' | 'hot';
    leadEvents?: string[];
    leadPrompted?: boolean;
    testDriveSuggested?: boolean;
    lastActivityAt?: number;
};

@Injectable()
export class ConversationStore {

    // ─────────────────────────────
    // Conversation memory
    // ─────────────────────────────
    private inventoryState = new Map<string, ConversationInventoryState>();

    // ─────────────────────────────
    // VIN decode cache
    // ─────────────────────────────
    private vinCache = new Map<string, VinProfile>();

    private defaultState(): ConversationInventoryState {
        return {
            lead: {},
            appointment: {},
            leadScore: 0,
            leadEvents: [],
            leadStage: 'cold',
        };
    }

    // ─────────────────────────────
    // Inventory memory
    // ─────────────────────────────
    getInventoryState(userId: string): ConversationInventoryState {
        return (
            this.inventoryState.get(userId) ??
            this.defaultState()
        );
    }

    setInventoryState(
        userId: string,
        input:
            | Partial<ConversationInventoryState>
            | InventoryUpdate,
    ) {
        const current = this.getInventoryState(userId);

        let next: ConversationInventoryState;

        if ('patch' in input && 'remove' in input) {
            next = applyInventoryUpdate(current, input);
        } else {
            next = {
                ...current,
                ...input,
                lead: {
                    ...current.lead,
                    ...(input as Partial<ConversationInventoryState>).lead,
                },
                appointment: {
                    ...current.appointment,
                    ...(input as Partial<ConversationInventoryState>).appointment,
                },
            };
        }

        this.inventoryState.set(userId, next);
    }

    clearInventoryState(userId: string) {
        this.inventoryState.delete(userId);
    }

    // ─────────────────────────────
    // Lead helpers
    // ─────────────────────────────
    getLead(userId: string): LeadState {
        return this.getInventoryState(userId).lead ?? {};
    }

    setLead(userId: string, patch: Partial<LeadState>) {
        const current = this.getInventoryState(userId);
        this.setInventoryState(userId, {
            lead: { ...current.lead, ...patch },
        });
    }

    leadIsComplete(lead?: LeadState): boolean {
        if (!lead) return false;
        const hasName = !!lead.firstName;
        const hasContact = !!lead.phone || !!lead.email;
        return hasName && hasContact;
    }

    missingLeadFields(lead?: LeadState): Array<'firstName' | 'phoneOrEmail'> {
        const out: Array<'firstName' | 'phoneOrEmail'> = [];
        if (!lead?.firstName) out.push('firstName');
        if (!(lead?.phone || lead?.email)) out.push('phoneOrEmail');
        return out;
    }

    // ─────────────────────────────
    // 💳 PAYMENT MEMORY
    // ─────────────────────────────
    mergePayment(userId: string, prefs: PaymentPreferences) {
        const current = this.getInventoryState(userId);

        this.setInventoryState(userId, {
            maxMonthlyPayment:
                prefs.maxMonthly ?? current.maxMonthlyPayment,
            downPayment:
                prefs.downPayment ?? current.downPayment,
            termMonths:
                prefs.termMonths ?? current.termMonths,
            apr:
                prefs.apr ?? current.apr,
        });
    }

    // ─────────────────────────────
    // VIN CACHE
    // ─────────────────────────────
    getVinProfile(vin: string): VinProfile | undefined {
        return this.vinCache.get(vin);
    }

    setVinProfile(vin: string, profile: VinProfile): void {
        this.vinCache.set(vin, profile);
    }
}
