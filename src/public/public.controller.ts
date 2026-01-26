import {
    Controller,
    Get,
    Post,
    Query,
    Body,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public')
export class PublicController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    // --------------------------------------------------
    // GET /public/widget-config
    // --------------------------------------------------
    @Get('widget-config')
    async widgetConfig(
        @Query('tenantSlug') tenantSlug: string,
        @Query('locationSlug') locationSlug: string,
    ) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            select: { id: true, name: true, slug: true },
        });

        if (!tenant) {
            return { ok: false, error: 'TENANT_NOT_FOUND' };
        }

        const location = await this.prisma.location.findFirst({
            where: {
                tenantId: tenant.id,
                slug: locationSlug,
            },
            select: { id: true, name: true, slug: true },
        });

        if (!location) {
            return { ok: false, error: 'LOCATION_NOT_FOUND' };
        }

        return {
            ok: true,
            tenant,
            location,
        };
    }

    // --------------------------------------------------
    // POST /public/widget-token
    // --------------------------------------------------
    @Post('widget-token')
    async widgetToken(
        @Body()
        body: {
            tenantSlug: string;
            locationSlug: string;
        },
    ) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: body.tenantSlug },
            select: { id: true },
        });

        if (!tenant) {
            throw new BadRequestException('TENANT_NOT_FOUND');
        }

        const location = await this.prisma.location.findFirst({
            where: {
                tenantId: tenant.id,
                slug: body.locationSlug,
            },
            select: { id: true },
        });

        if (!location) {
            throw new BadRequestException('LOCATION_NOT_FOUND');
        }

        // 🔐 short-lived widget JWT
        const token = this.jwtService.sign(
            {
                tenantId: tenant.id,
                locationId: location.id,
                role: 'widget',
                scope: ['chat'],
            },
            {
                secret: process.env.JWT_SECRET,
                expiresIn: '30m',
            },
        );


        return {
            ok: true,
            token,
            expiresIn: 1800,
        };
    }
}
