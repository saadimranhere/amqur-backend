"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryFeedModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_feed_controller_1 = require("./inventory-feed.controller");
const inventory_feed_service_1 = require("./inventory-feed.service");
const auth_module_1 = require("../auth/auth.module");
let InventoryFeedModule = class InventoryFeedModule {
};
exports.InventoryFeedModule = InventoryFeedModule;
exports.InventoryFeedModule = InventoryFeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
        ],
        controllers: [inventory_feed_controller_1.InventoryFeedController],
        providers: [inventory_feed_service_1.InventoryFeedService],
        exports: [inventory_feed_service_1.InventoryFeedService],
    })
], InventoryFeedModule);
//# sourceMappingURL=inventory-feed.module.js.map