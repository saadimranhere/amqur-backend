import { InventoryEngine } from './engines/inventory.engine';
import { AppointmentExtractor } from './appointment-extractor';
import { VinExtractor } from './vin-extractor';
import { VinExplainerService } from './vin/vin-explainer.service';
import { PaymentService } from '../payment/payment.service';
import { VinDecoderService } from './vin/vin-decoder.service';
import { VinProfile } from './vin/vin.types';
import { CompareExtractor } from './compare-extractor';
import { ConversationStore } from './memory/conversation.store';
import { InventoryVehicle } from './types/vehicle.types';
import { CrmWebhookService } from './crm-webhook.service';
import { LeadExtractor } from './lead-extractor';
import { PaymentExplainer } from './payment-explainer';
import { MediaEngine } from './media/media.engine';
import { IntelligentRouter } from './intelligence/intelligent.router';
import { IntelligentService } from './intelligence/intelligent.service';
import { FollowupEngine } from './followup/followup.engine';
type ChatResponse = {
    reply: string;
} | {
    type: 'vehicle_detail';
    vehicle: VinProfile;
    reply: string;
} | {
    type: 'vehicle_carousel';
    vehicles: InventoryVehicle[];
    reply: string;
} | {
    type: 'vehicle_compare';
    vehicles: InventoryVehicle[];
    reply: string;
};
export declare class ChatOrchestrator {
    private readonly inventoryEngine;
    private readonly memory;
    private readonly appointmentExtractor;
    private readonly vinExtractor;
    private readonly vinDecoder;
    private readonly compareExtractor;
    private readonly crmWebhook;
    private readonly leadExtractor;
    private readonly paymentExplainer;
    private readonly mediaEngine;
    private readonly intelligentRouter;
    private readonly intelligentService;
    private readonly vinExplainer;
    private readonly followup;
    private readonly paymentService;
    constructor(inventoryEngine: InventoryEngine, memory: ConversationStore, appointmentExtractor: AppointmentExtractor, vinExtractor: VinExtractor, vinDecoder: VinDecoderService, compareExtractor: CompareExtractor, crmWebhook: CrmWebhookService, leadExtractor: LeadExtractor, paymentExplainer: PaymentExplainer, mediaEngine: MediaEngine, intelligentRouter: IntelligentRouter, intelligentService: IntelligentService, vinExplainer: VinExplainerService, followup: FollowupEngine, paymentService: PaymentService);
    private trackLeadEvent;
    private getLeadIntelligence;
    private handleLeadCompletion;
    private ensureLead;
    private shouldPromptLead;
    private shouldSuggestTestDrive;
    private buildCrmPayload;
    handleMessage(input: {
        message?: string;
        action?: string;
        vin?: string;
        conversationId?: string;
        role?: string;
        tenantId: string;
        userId: string;
        locationId?: string | null;
    }): Promise<ChatResponse>;
    private enrichVehiclesWithVin;
}
export {};
