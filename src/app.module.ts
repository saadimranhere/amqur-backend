import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
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
    // 🌎 ENV VALIDATION (must be FIRST)
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),

    // 🚦 Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60,
        limit: 60,
      },
    ]),

    // ⏱ Scheduled jobs
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
    // 🔐 Re-enable global JWT protection
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('{*path}');
  }
}
