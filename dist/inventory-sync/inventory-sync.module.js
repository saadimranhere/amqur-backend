"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySyncModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_sync_service_1 = require("./inventory-sync.service");
const inventory_feed_module_1 = require("../inventory-feed/inventory-feed.module");
const inventory_module_1 = require("../inventory/inventory.module");
const prisma_module_1 = require("../prisma/prisma.module");
let InventorySyncModule = class InventorySyncModule {
};
exports.InventorySyncModule = InventorySyncModule;
exports.InventorySyncModule = InventorySyncModule = __decorate([
    (0, common_1.Module)({
        imports: [
            inventory_feed_module_1.InventoryFeedModule,
            inventory_module_1.InventoryModule,
            prisma_module_1.PrismaModule,
        ],
        providers: [inventory_sync_service_1.InventorySyncService],
    })
], InventorySyncModule);
//# sourceMappingURL=inventory-sync.module.js.map