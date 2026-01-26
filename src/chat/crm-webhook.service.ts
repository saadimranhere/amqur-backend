import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CrmWebhookService {
    private readonly logger = new Logger(CrmWebhookService.name);

    async send(payload: any) {
        const url = process.env.CRM_WEBHOOK_URL;
        if (!url) {
            this.logger.warn(
                'CRM_WEBHOOK_URL not configured — skipping webhook.',
            );
            return;
        }

        try {
            await axios.post(url, payload, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            this.logger.log('CRM webhook sent successfully.');
        } catch (error: any) {
            this.logger.error(
                'CRM webhook failed',
                error?.response?.data || error.message,
            );
        }
    }
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
