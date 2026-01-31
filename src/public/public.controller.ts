import { Controller, Get, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('public')
export class PublicController {
    constructor(
        private readonly publicService: PublicService,
    ) { }

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

    @Public()
    @Get('health')
    health() {
        return { ok: true };
    }
}
