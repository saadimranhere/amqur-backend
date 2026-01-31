"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const tenants_module_1 = require("./tenants/tenants.module");
const locations_module_1 = require("./locations/locations.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const chat_module_1 = require("./chat/chat.module");
const inventory_module_1 = require("./inventory/inventory.module");
const inventory_feed_module_1 = require("./inventory-feed/inventory-feed.module");
const inventory_sync_module_1 = require("./inventory-sync/inventory-sync.module");
const public_module_1 = require("./public/public.module");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('api/*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60,
                    limit: 60,
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            tenants_module_1.TenantsModule,
            locations_module_1.LocationsModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            public_module_1.PublicModule,
            chat_module_1.ChatModule,
            inventory_module_1.InventoryModule,
            inventory_feed_module_1.InventoryFeedModule,
            inventory_sync_module_1.InventorySyncModule,
        ],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map