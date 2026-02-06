import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { WidgetAuthService } from './widget-auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        PrismaModule,
        AuthModule, // provides JwtService
    ],
    controllers: [PublicController],
    providers: [
        PublicService,      // ← we accidentally removed this earlier
        WidgetAuthService,  // ← new widget token service
    ],
})
export class PublicModule { }
