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
import { PublicAwareThrottlerGuard } from './auth/guards/public-throttler.guard';
import { LoggerMiddleware } from './common/middleware/logger.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60,
        limit: 60,
      },
    ]),

    ScheduleModule.forRoot(),

    PrismaModule,
    TenantsModule,
    LocationsModule,
    UsersModule,
    AuthModule,
    ChatModule,
    InventoryModule,
    InventoryFeedModule,
    InventorySyncModule,
    PublicModule,
  ],

  providers: [
    // 🔐 Global JWT guard (respects @Public)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 🚦 Global rate limiting
    {
      provide: APP_GUARD,
      useClass: PublicAwareThrottlerGuard,
    },

  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
