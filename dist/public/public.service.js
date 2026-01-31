"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicService = class PublicService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWidgetConfig(tenantSlug, locationSlug) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            include: {
                locations: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('TENANT_NOT_FOUND');
        }
        const location = locationSlug
            ? tenant.locations.find((l) => l.slug === locationSlug)
            : tenant.locations[0];
        if (!location) {
            throw new common_1.NotFoundException('LOCATION_NOT_FOUND');
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
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map