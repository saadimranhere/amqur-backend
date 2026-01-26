import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryVehicle } from '../chat/types/vehicle.types';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Single-vehicle upsert
     * Used for manual ingestion or APIs
     */
    async upsertVehicle(params: {
        tenantId: string;
        locationId?: string | null;
        vehicle: any;
    }) {
        const v = params.vehicle;
        if (!v?.vin) return;

        return this.prisma.vehicle.upsert({
            where: { vin: v.vin },

            update: {
                ...v,
                tenantId: params.tenantId,
                locationId: params.locationId ?? null,
                updatedAt: new Date(),
            },

            create: {
                ...v,
                tenantId: params.tenantId,
                locationId: params.locationId ?? null,
            },
        });
    }

    /**
     * Batch inventory feed upsert
     * VIN = source of truth
     */
    async upsertVehicles(
        tenantId: string,
        locationId: string | null,
        vehicles: InventoryVehicle[],
    ) {
        const now = new Date();

        for (const v of vehicles) {
            if (!v?.vin) continue;

            await this.prisma.vehicle.upsert({
                where: { vin: v.vin },

                update: {
                    ...v,
                    tenantId,
                    locationId,
                    status: VehicleStatus.AVAILABLE,
                    lastSeenAt: now,
                },

                create: {
                    vin: v.vin,

                    // required fields
                    year: v.year ?? 0,
                    make: v.make ?? 'UNKNOWN',
                    model: v.model ?? 'UNKNOWN',

                    // optional fields
                    trim: v.trim ?? null,
                    bodyType: v.bodyType ?? null,
                    drivetrain: v.drivetrain ?? null,
                    transmission: v.transmission ?? null,
                    fuelType: v.fuelType ?? null,
                    color: v.color ?? null,

                    price: v.price ?? null,
                    msrp: v.msrp ?? null,
                    mileage: v.mileage ?? null,

                    // Prisma JSON field
                    photos: v.photos ?? undefined,

                    tenantId,
                    locationId,

                    status: VehicleStatus.AVAILABLE,
                    lastSeenAt: now,
                },
            });
        }
    }

    /**
     * Inventory lifecycle engine
     *
     * AVAILABLE → MISSING → SOLD
     *
     * Protects against:
     * - feed outages
     * - vendor glitches
     * - partial exports
     */
    async updateVehicleLifecycle(locationId: string) {
        const now = new Date();

        // 24 hours unseen = suspicious
        const missingThreshold = new Date(
            now.getTime() - 24 * 60 * 60 * 1000,
        );

        // 7 days unseen = confirmed sold
        const soldThreshold = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
        );

        // AVAILABLE → MISSING
        await this.prisma.vehicle.updateMany({
            where: {
                locationId,
                status: VehicleStatus.AVAILABLE,
                lastSeenAt: { lt: missingThreshold },
            },
            data: {
                status: VehicleStatus.MISSING,
            },
        });

        // MISSING → SOLD
        await this.prisma.vehicle.updateMany({
            where: {
                locationId,
                status: VehicleStatus.MISSING,
                lastSeenAt: { lt: soldThreshold },
            },
            data: {
                status: VehicleStatus.SOLD,
            },
        });
    }
}
