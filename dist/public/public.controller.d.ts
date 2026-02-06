import { PublicService } from './public.service';
import { WidgetAuthService } from './widget-auth.service';
import { WidgetTokenDto } from './dto/widget-token.dto';
export declare class PublicController {
    private readonly publicService;
    private readonly widgetAuthService;
    constructor(publicService: PublicService, widgetAuthService: WidgetAuthService);
    widgetConfig(tenantSlug: string, locationSlug?: string): Promise<{
        ok: boolean;
        tenant: {
            id: string;
            name: string;
            slug: string;
        };
        location: {
            id: string;
            name: string;
            slug: string;
        };
        branding: {
            primaryColor: string;
            accentColor: string;
            logoUrl: null;
        };
        features: {
            chat: boolean;
            inventory: boolean;
            payments: boolean;
        };
    }>;
    createWidgetToken(dto: WidgetTokenDto): Promise<{
        token: string;
    }>;
    health(): {
        ok: boolean;
    };
}
