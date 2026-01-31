import { Controller, Get, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
    constructor(
        private readonly publicService: PublicService,
    ) { }

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
}
