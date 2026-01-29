"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicAwareThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let PublicAwareThrottlerGuard = class PublicAwareThrottlerGuard extends throttler_1.ThrottlerGuard {
    async shouldSkip(context) {
        const request = context.switchToHttp().getRequest();
        const path = request?.route?.path;
        if (path === '/auth/register' ||
            path === '/auth/login' ||
            path === '/public/widget-token' ||
            path === '/public/widget-config') {
            return true;
        }
        return false;
    }
};
exports.PublicAwareThrottlerGuard = PublicAwareThrottlerGuard;
exports.PublicAwareThrottlerGuard = PublicAwareThrottlerGuard = __decorate([
    (0, common_1.Injectable)()
], PublicAwareThrottlerGuard);
//# sourceMappingURL=public-throttler.guard.js.map