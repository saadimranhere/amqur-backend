import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { LocationsModule } from './locations/locations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryFeedModule } from './inventory-feed/inventory-feed.module';
import { InventorySyncModule } from './inventory-sync/inventory-sync.module';
import { PublicModule } from './public/public.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    // 🌎 ENV
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🚦 Rate limiting (NestJS throttler v6)
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60,
        limit: 60,
      },
    ]),

    // ⏱ scheduled jobs
    ScheduleModule.forRoot(),

    // 🧠 Core
    PrismaModule,

    // 🏢 Platform modules
    TenantsModule,
    LocationsModule,
    UsersModule,
    AuthModule,
    PublicModule,

    // 🤖 Product modules
    ChatModule,
    InventoryModule,
    InventoryFeedModule,
    InventorySyncModule,
  ],

  providers: [
    // 🔐 SINGLE global JWT guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('api/*');
  }
}
