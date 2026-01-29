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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertVehicle(params) {
        const v = params.vehicle;
        if (!v?.vin)
            return;
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
    async upsertVehicles(tenantId, locationId, vehicles) {
        const now = new Date();
        for (const v of vehicles) {
            if (!v?.vin)
                continue;
            await this.prisma.vehicle.upsert({
                where: { vin: v.vin },
                update: {
                    ...v,
                    tenantId,
                    locationId,
                    status: client_1.VehicleStatus.AVAILABLE,
                    lastSeenAt: now,
                },
                create: {
                    vin: v.vin,
                    year: v.year ?? 0,
                    make: v.make ?? 'UNKNOWN',
                    model: v.model ?? 'UNKNOWN',
                    trim: v.trim ?? null,
                    bodyType: v.bodyType ?? null,
                    drivetrain: v.drivetrain ?? null,
                    transmission: v.transmission ?? null,
                    fuelType: v.fuelType ?? null,
                    color: v.color ?? null,
                    price: v.price ?? null,
                    msrp: v.msrp ?? null,
                    mileage: v.mileage ?? null,
                    photos: v.photos ?? undefined,
                    tenantId,
                    locationId,
                    status: client_1.VehicleStatus.AVAILABLE,
                    lastSeenAt: now,
                },
            });
        }
    }
    async updateVehicleLifecycle(locationId) {
        const now = new Date();
        const missingThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const soldThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        await this.prisma.vehicle.updateMany({
            where: {
                locationId,
                status: client_1.VehicleStatus.AVAILABLE,
                lastSeenAt: { lt: missingThreshold },
            },
            data: {
                status: client_1.VehicleStatus.MISSING,
            },
        });
        await this.prisma.vehicle.updateMany({
            where: {
                locationId,
                status: client_1.VehicleStatus.MISSING,
                lastSeenAt: { lt: soldThreshold },
            },
            data: {
                status: client_1.VehicleStatus.SOLD,
            },
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map