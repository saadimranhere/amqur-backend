import { PrismaService } from '../prisma/prisma.service';
export declare class PublicService {
    private prisma;
    constructor(prisma: PrismaService);
    getWidgetConfig(tenantSlug: string, locationSlug?: string): Promise<{
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
}
