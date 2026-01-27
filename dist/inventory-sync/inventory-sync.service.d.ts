import { PrismaService } from '../prisma/prisma.service';
import { InventoryFeedService } from '../inventory-feed/inventory-feed.service';
import { InventoryService } from '../inventory/inventory.service';
export declare class InventorySyncService {
    private readonly prisma;
    private readonly feed;
    private readonly inventory;
    private readonly logger;
    constructor(prisma: PrismaService, feed: InventoryFeedService, inventory: InventoryService);
    sync(): Promise<void>;
}
