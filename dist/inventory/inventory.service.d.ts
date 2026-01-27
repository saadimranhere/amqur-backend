import { PrismaService } from '../prisma/prisma.service';
import { InventoryVehicle } from '../chat/types/vehicle.types';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertVehicle(params: {
        tenantId: string;
        locationId?: string | null;
        vehicle: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        locationId: string | null;
        trim: string | null;
        year: number;
        price: number | null;
        make: string;
        model: string;
        vin: string;
        stock: string | null;
        bodyType: string | null;
        drivetrain: string | null;
        transmission: string | null;
        fuelType: string | null;
        color: string | null;
        msrp: number | null;
        mileage: number | null;
        photos: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        lastSeenAt: Date | null;
    } | undefined>;
    upsertVehicles(tenantId: string, locationId: string | null, vehicles: InventoryVehicle[]): Promise<void>;
    updateVehicleLifecycle(locationId: string): Promise<void>;
}
