import { PrismaService } from '../../prisma/prisma.service';
import { PaymentEngine } from './payment.engine';
import { PhotoEnrichmentService } from './photo-enrichment.service';
export declare class InventoryEngine {
    private readonly prisma;
    private readonly paymentEngine;
    private readonly photoService;
    constructor(prisma: PrismaService, paymentEngine: PaymentEngine, photoService: PhotoEnrichmentService);
    searchVehicles(params: {
        tenantId: string;
        locationId?: string | null;
        query?: string;
        year?: number;
        maxPrice?: number;
        maxMonthlyPayment?: number;
    }): Promise<any[]>;
    getVehiclesByVin(tenantId: string, vins: string[]): Promise<any[]>;
    getVehicleByVin(tenantId: string, vin: string): Promise<any>;
    holdVehicle(tenantId: string, vin: string): Promise<void>;
}
