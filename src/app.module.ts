import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { PublicModule } from './public/public.module';

import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { LocationsModule } from './locations/locations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryFeedModule } from './inventory-feed/inventory-feed.module';
import { InventorySyncModule } from './inventory-sync/inventory-sync.module';

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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
