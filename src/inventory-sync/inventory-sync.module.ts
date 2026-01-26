import { Module } from '@nestjs/common';
import { InventorySyncService } from './inventory-sync.service';
import { InventoryFeedModule } from '../inventory-feed/inventory-feed.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        InventoryFeedModule,
        InventoryModule,   // ✅ REQUIRED
        PrismaModule,
    ],
    providers: [InventorySyncService],
})
export class InventorySyncModule { }
