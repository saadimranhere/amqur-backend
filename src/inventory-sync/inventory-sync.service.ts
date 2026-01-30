import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryFeedService } from '../inventory-feed/inventory-feed.service';
import { InventoryService } from '../inventory/inventory.service';
import { VehicleNormalizer } from '../inventory-feed/normalizer/vehicle.normalizer';

@Injectable()
export class InventorySyncService {
    private readonly logger = new Logger(InventorySyncService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly feed: InventoryFeedService,
        private readonly inventory: InventoryService,
    ) { }

    /**
     * Runs every 30 minutes
     * Handles:
     * - feed ingestion
     * - normalization
     * - upserts
     * - lifecycle reconciliation
     */
    @Cron('*/30 * * * *')
    async sync() {

        if (process.env.INVENTORY_SYNC_ENABLED !== 'true') {
            this.logger.warn('⏸ Inventory sync disabled by env flag');
            return;
        }

        this.logger.log('🔄 Inventory auto-sync started');

        const locations = await this.prisma.location.findMany();

        const locationsWithFeeds = locations.filter(
            (l) =>
                typeof l.inventoryFeedUrl === 'string' &&
                l.inventoryFeedUrl.trim().length > 0 &&
                l.inventoryFeedType !== null &&
                l.inventoryFeedType !== undefined,
        );

        if (!locationsWithFeeds.length) {
            this.logger.log('ℹ️ No inventory feeds configured');
            return;
        }

        for (const location of locationsWithFeeds) {
            try {
                this.logger.log(`📥 Inventory sync starting for ${location.name}`);

                const rawFeed = await this.feed.fetchFeed(location.inventoryFeedUrl!);

                const records = this.feed.parseFeed(location.inventoryFeedType as any, rawFeed);

                const vehicles = records
                    .map((r) => VehicleNormalizer.normalize(r))
                    .filter((v) => v !== null);

                this.logger.log(
                    `🧪 Parsed ${records.length} records, normalized ${vehicles.length} valid vehicles for ${location.name}`,
                );

                // 1️⃣ Upsert inventory (VIN is truth)
                await this.inventory.upsertVehicles(location.tenantId, location.id, vehicles);

                // 2️⃣ Lifecycle reconciliation
                // AVAILABLE → MISSING → SOLD (time-based)
                await this.inventory.updateVehicleLifecycle(location.id);

                this.logger.log(`✅ ${vehicles.length} vehicles synced for ${location.name}`);
            } catch (error: any) {
                this.logger.error(`❌ Inventory sync failed for ${location.name}`, error?.message ?? error);
            }
        }

        this.logger.log('🏁 Inventory auto-sync finished');
    }
}
