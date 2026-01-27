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
var InventorySyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const inventory_feed_service_1 = require("../inventory-feed/inventory-feed.service");
const inventory_service_1 = require("../inventory/inventory.service");
const vehicle_normalizer_1 = require("../inventory-feed/normalizer/vehicle.normalizer");
let InventorySyncService = InventorySyncService_1 = class InventorySyncService {
    prisma;
    feed;
    inventory;
    logger = new common_1.Logger(InventorySyncService_1.name);
    constructor(prisma, feed, inventory) {
        this.prisma = prisma;
        this.feed = feed;
        this.inventory = inventory;
    }
    async sync() {
        this.logger.log('🔄 Inventory auto-sync started');
        const locations = await this.prisma.location.findMany();
        const locationsWithFeeds = locations.filter((l) => typeof l.inventoryFeedUrl === 'string' &&
            l.inventoryFeedUrl.trim().length > 0);
        if (!locationsWithFeeds.length) {
            this.logger.log('ℹ️ No inventory feeds configured');
            return;
        }
        for (const location of locationsWithFeeds) {
            try {
                this.logger.log(`📥 Inventory sync starting for ${location.name}`);
                const rawFeed = await this.feed.fetchFeed(location.inventoryFeedUrl);
                const records = this.feed.parseFeed(location.inventoryFeedType, rawFeed);
                const vehicles = records.map(vehicle_normalizer_1.VehicleNormalizer.normalize);
                await this.inventory.upsertVehicles(location.tenantId, location.id, vehicles);
                await this.inventory.updateVehicleLifecycle(location.id);
                this.logger.log(`✅ ${vehicles.length} vehicles synced for ${location.name}`);
            }
            catch (error) {
                this.logger.error(`❌ Inventory sync failed for ${location.name}`, error?.message ?? error);
            }
        }
        this.logger.log('🏁 Inventory auto-sync finished');
    }
};
exports.InventorySyncService = InventorySyncService;
__decorate([
    (0, schedule_1.Cron)('*/30 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventorySyncService.prototype, "sync", null);
exports.InventorySyncService = InventorySyncService = InventorySyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_feed_service_1.InventoryFeedService,
        inventory_service_1.InventoryService])
], InventorySyncService);
//# sourceMappingURL=inventory-sync.service.js.map