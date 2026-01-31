import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
    constructor(private prisma: PrismaService) { }

    async getWidgetConfig(
        tenantSlug: string,
        locationSlug?: string,
    ) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            include: {
                locations: true,
            },
        });

        if (!tenant) {
            throw new NotFoundException('TENANT_NOT_FOUND');
        }

        const location = locationSlug
            ? tenant.locations.find(
                (l) => l.slug === locationSlug,
            )
            : tenant.locations[0];

        if (!location) {
            throw new NotFoundException('LOCATION_NOT_FOUND');
        }

        return {
            ok: true,

            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
            },

            location: {
                id: location.id,
                name: location.name,
                slug: location.slug,
            },

            branding: {
                primaryColor: '#000000',
                accentColor: '#ffffff',
                logoUrl: null,
            },

            features: {
                chat: true,
                inventory: true,
                payments: true,
            },
        };
    }
}
