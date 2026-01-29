import { VinProfile } from '../vin/vin.types';
import { InventoryUpdate } from '../engines/inventory.extractor';
import { PaymentPreferences } from '../payment/payment.types';
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
export type ConversationInventoryState = {
    query?: string;
    year?: number;
    maxPrice?: number;
    maxMonthlyPayment?: number;
    downPayment?: number;
    termMonths?: number;
    apr?: number;
    lastEstimatedPayment?: number;
    visibleVins?: string[];
    selectedVin?: string;
    compareVins?: string[];
    color?: string;
    drivetrain?: string;
    bodyType?: string;
    sortBy?: 'price_asc' | 'price_desc';
    lead?: LeadState;
    appointment?: AppointmentState;
    leadScore?: number;
    leadStage?: 'cold' | 'warm' | 'hot';
    leadEvents?: string[];
    leadPrompted?: boolean;
    testDriveSuggested?: boolean;
    lastActivityAt?: number;
};
export declare class ConversationStore {
    private inventoryState;
    private vinCache;
    private defaultState;
    getInventoryState(userId: string): ConversationInventoryState;
    setInventoryState(userId: string, input: Partial<ConversationInventoryState> | InventoryUpdate): void;
    clearInventoryState(userId: string): void;
    getLead(userId: string): LeadState;
    setLead(userId: string, patch: Partial<LeadState>): void;
    leadIsComplete(lead?: LeadState): boolean;
    missingLeadFields(lead?: LeadState): Array<'firstName' | 'phoneOrEmail'>;
    mergePayment(userId: string, prefs: PaymentPreferences): void;
    getVinProfile(vin: string): VinProfile | undefined;
    setVinProfile(vin: string, profile: VinProfile): void;
}
