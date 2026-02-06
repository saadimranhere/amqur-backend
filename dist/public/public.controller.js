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
const public_service_1 = require("./public.service");
const widget_auth_service_1 = require("./widget-auth.service");
const widget_token_dto_1 = require("./dto/widget-token.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
let PublicController = class PublicController {
    publicService;
    widgetAuthService;
    constructor(publicService, widgetAuthService) {
        this.publicService = publicService;
        this.widgetAuthService = widgetAuthService;
    }
    async widgetConfig(tenantSlug, locationSlug) {
        return this.publicService.getWidgetConfig(tenantSlug, locationSlug);
    }
    async createWidgetToken(dto) {
        return this.widgetAuthService.createWidgetToken(dto.tenantSlug, dto.locationSlug);
    }
    health() {
        return { ok: true };
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('widget-config'),
    __param(0, (0, common_1.Query)('tenantSlug')),
    __param(1, (0, common_1.Query)('locationSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "widgetConfig", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('widget-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [widget_token_dto_1.WidgetTokenDto]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "createWidgetToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "health", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_service_1.PublicService,
        widget_auth_service_1.WidgetAuthService])
], PublicController);
//# sourceMappingURL=public.controller.js.map