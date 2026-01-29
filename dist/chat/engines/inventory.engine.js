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
exports.InventoryEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const payment_engine_1 = require("./payment.engine");
const photo_enrichment_service_1 = require("./photo-enrichment.service");
let InventoryEngine = class InventoryEngine {
    prisma;
    paymentEngine;
    photoService;
    constructor(prisma, paymentEngine, photoService) {
        this.prisma = prisma;
        this.paymentEngine = paymentEngine;
        this.photoService = photoService;
    }
    async searchVehicles(params) {
        const { tenantId, locationId, query, year, maxPrice, maxMonthlyPayment, } = params;
        const cleanedQuery = query
            ?.toLowerCase()
            .replace(/\b(under|below|less than|\$|usd)\b/g, '')
            .replace(/\b\d{4}\b/g, '')
            .replace(/jeeps/g, 'jeep')
            .trim();
        let vehicles = await this.prisma.vehicle.findMany({
            where: {
                tenantId,
                ...(locationId
                    ? {
                        OR: [
                            { locationId },
                            { locationId: null },
                        ],
                    }
                    : {}),
                ...(year && { year }),
                ...(maxPrice && { price: { lte: maxPrice } }),
                ...(cleanedQuery && {
                    OR: [
                        {
                            model: {
                                contains: cleanedQuery,
                                mode: 'insensitive',
                            },
                        },
                        {
                            make: {
                                contains: cleanedQuery,
                                mode: 'insensitive',
                            },
                        },
                    ],
                }),
            },
            orderBy: { createdAt: 'desc' },
        });
        if (maxMonthlyPayment) {
            vehicles = vehicles.filter(vehicle => {
                if (vehicle.price == null)
                    return false;
                const payment = this.paymentEngine.calculateMonthlyPayment({
                    price: vehicle.price,
                });
                return payment <= maxMonthlyPayment;
            });
        }
        return vehicles
            .map(vehicle => {
            const estimatedPayment = vehicle.price != null
                ? this.paymentEngine.calculateMonthlyPayment({
                    price: vehicle.price,
                })
                : null;
            return {
                id: vehicle.id,
                vin: vehicle.vin,
                stock: vehicle.stock,
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                trim: vehicle.trim,
                price: vehicle.price,
                msrp: vehicle.msrp,
                mileage: vehicle.mileage,
                color: vehicle.color,
                drivetrain: vehicle.drivetrain,
                bodyType: vehicle.bodyType,
                transmission: vehicle.transmission,
                fuelType: vehicle.fuelType,
                photos: Array.isArray(vehicle.photos)
                    ? vehicle.photos
                    : [],
                estimatedPayment,
                status: vehicle.status,
                locationId: vehicle.locationId,
            };
        })
            .map(vehicle => this.photoService.enrich(vehicle));
    }
    async getVehiclesByVin(tenantId, vins) {
        const vehicles = await this.prisma.vehicle.findMany({
            where: {
                tenantId,
                vin: { in: vins },
            },
            orderBy: { createdAt: 'desc' },
        });
        return vehicles.map(vehicle => {
            const estimatedPayment = vehicle.price != null
                ? this.paymentEngine.calculateMonthlyPayment({
                    price: vehicle.price,
                })
                : null;
            return this.photoService.enrich({
                id: vehicle.id,
                vin: vehicle.vin,
                stock: vehicle.stock,
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                trim: vehicle.trim,
                price: vehicle.price,
                msrp: vehicle.msrp,
                mileage: vehicle.mileage,
                color: vehicle.color,
                drivetrain: vehicle.drivetrain,
                bodyType: vehicle.bodyType,
                transmission: vehicle.transmission,
                fuelType: vehicle.fuelType,
                photos: Array.isArray(vehicle.photos)
                    ? vehicle.photos
                    : [],
                estimatedPayment,
                status: vehicle.status,
                locationId: vehicle.locationId,
            });
        });
    }
    async getVehicleByVin(tenantId, vin) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: {
                tenantId,
                vin,
            },
        });
        if (!vehicle)
            return null;
        const estimatedPayment = vehicle.price != null
            ? this.paymentEngine.calculateMonthlyPayment({
                price: vehicle.price,
            })
            : null;
        return this.photoService.enrich({
            id: vehicle.id,
            vin: vehicle.vin,
            stock: vehicle.stock,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim,
            price: vehicle.price,
            msrp: vehicle.msrp,
            mileage: vehicle.mileage,
            color: vehicle.color,
            drivetrain: vehicle.drivetrain,
            bodyType: vehicle.bodyType,
            transmission: vehicle.transmission,
            fuelType: vehicle.fuelType,
            photos: Array.isArray(vehicle.photos)
                ? vehicle.photos
                : [],
            estimatedPayment,
            status: vehicle.status,
            locationId: vehicle.locationId,
        });
    }
    async holdVehicle(tenantId, vin) {
        await this.prisma.vehicle.update({
            where: { vin },
            data: { status: 'HOLD' },
        });
    }
};
exports.InventoryEngine = InventoryEngine;
exports.InventoryEngine = InventoryEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_engine_1.PaymentEngine,
        photo_enrichment_service_1.PhotoEnrichmentService])
], InventoryEngine);
//# sourceMappingURL=inventory.engine.js.map