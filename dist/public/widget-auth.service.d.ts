import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class WidgetAuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    createWidgetToken(tenantSlug: string, locationSlug: string): Promise<{
        token: string;
    }>;
}
