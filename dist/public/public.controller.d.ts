import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class PublicController {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    widgetConfig(tenantSlug: string, locationSlug: string): Promise<{
        ok: boolean;
        error: string;
        tenant?: undefined;
        location?: undefined;
    } | {
        ok: boolean;
        tenant: {
            id: string;
            slug: string;
            name: string;
        };
        location: {
            id: string;
            slug: string;
            name: string;
        };
        error?: undefined;
    }>;
    widgetToken(body: {
        tenantSlug: string;
        locationSlug: string;
    }): Promise<{
        ok: boolean;
        token: string;
        expiresIn: number;
    }>;
}
