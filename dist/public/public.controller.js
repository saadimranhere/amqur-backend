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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicController = class PublicController {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async widgetConfig(tenantSlug, locationSlug) {
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
    async widgetToken(body) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: body.tenantSlug },
            select: { id: true },
        });
        if (!tenant) {
            throw new common_1.BadRequestException('TENANT_NOT_FOUND');
        }
        const location = await this.prisma.location.findFirst({
            where: {
                tenantId: tenant.id,
                slug: body.locationSlug,
            },
            select: { id: true },
        });
        if (!location) {
            throw new common_1.BadRequestException('LOCATION_NOT_FOUND');
        }
        const token = this.jwtService.sign({
            tenantId: tenant.id,
            locationId: location.id,
            role: 'widget',
            scope: ['chat'],
        }, {
            secret: process.env.JWT_SECRET,
            expiresIn: '30m',
        });
        return {
            ok: true,
            token,
            expiresIn: 1800,
        };
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('widget-config'),
    __param(0, (0, common_1.Query)('tenantSlug')),
    __param(1, (0, common_1.Query)('locationSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "widgetConfig", null);
__decorate([
    (0, common_1.Post)('widget-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "widgetToken", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], PublicController);
//# sourceMappingURL=public.controller.js.map