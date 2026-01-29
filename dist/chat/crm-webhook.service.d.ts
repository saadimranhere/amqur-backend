export declare class CrmWebhookService {
    private readonly logger;
    send(payload: any): Promise<void>;
}
export type CrmPayload = {
    source: string;
    tenantId: string;
    locationId?: string | null;
    timestamp: string;
    lead?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    selectedVehicle?: {
        vin?: string;
        status?: 'VIEWED' | 'COMPARE' | 'HOLD';
    };
    appointment?: {
        date?: string;
        time?: string;
    };
    leadIntelligence?: {
        score: number;
        stage: 'cold' | 'warm' | 'hot';
        events: string[];
        lastEvent?: string;
    };
};
