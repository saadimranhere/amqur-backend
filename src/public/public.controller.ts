import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PublicService } from './public.service';
import { WidgetAuthService } from './widget-auth.service';
import { WidgetTokenDto } from './dto/widget-token.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('public')
export class PublicController {
    constructor(
        private readonly publicService: PublicService,
        private readonly widgetAuthService: WidgetAuthService,
    ) { }

    // Existing widget bootstrap config
    @Public()
    @Get('widget-config')
    async widgetConfig(
        @Query('tenantSlug') tenantSlug: string,
        @Query('locationSlug') locationSlug?: string,
    ) {
        return this.publicService.getWidgetConfig(
            tenantSlug,
            locationSlug,
        );
    }

    // 🆕 Widget JWT minting endpoint
    @Public()
    @Post('widget-token')
    async createWidgetToken(@Body() dto: WidgetTokenDto) {
        return this.widgetAuthService.createWidgetToken(
            dto.tenantSlug,
            dto.locationSlug,
        );
    }

    // Health check endpoint
    @Public()
    @Get('health')
    health() {
        return { ok: true };
    }
}
