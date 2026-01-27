"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VinExplainerService = void 0;
const common_1 = require("@nestjs/common");
let VinExplainerService = class VinExplainerService {
    explain(profile) {
        const lines = [];
        if (profile.trim) {
            if (/sport/i.test(profile.trim)) {
                lines.push(`This is the **Sport trim**, designed as the most affordable option with essential features.`);
            }
            else if (/sahara/i.test(profile.trim)) {
                lines.push(`The **Sahara trim** adds comfort upgrades like larger wheels, premium interior, and advanced tech.`);
            }
            else if (/rubicon/i.test(profile.trim)) {
                lines.push(`The **Rubicon trim** is built for serious off-road driving with locking differentials and heavy-duty suspension.`);
            }
            else if (/limited/i.test(profile.trim)) {
                lines.push(`The **Limited trim** focuses on luxury with premium materials and advanced safety features.`);
            }
            else {
                lines.push(`This vehicle comes in the **${profile.trim} trim**.`);
            }
        }
        if (profile.drivetrain) {
            if (/4x4|awd/i.test(profile.drivetrain)) {
                lines.push(`It features **${profile.drivetrain}**, making it excellent for snow, rain, and rough conditions.`);
            }
            else {
                lines.push(`It uses **${profile.drivetrain}**, ideal for everyday highway driving.`);
            }
        }
        if (profile.engine) {
            lines.push(`Powered by a **${profile.engine}** engine.`);
        }
        if (profile.fuelType) {
            if (/hybrid|electric/i.test(profile.fuelType)) {
                lines.push(`This is a **${profile.fuelType}**, offering better fuel efficiency and lower fuel costs.`);
            }
        }
        if (profile.bodyType) {
            lines.push(`Body style: **${profile.bodyType}**.`);
        }
        return lines.join(' ');
    }
};
exports.VinExplainerService = VinExplainerService;
exports.VinExplainerService = VinExplainerService = __decorate([
    (0, common_1.Injectable)()
], VinExplainerService);
//# sourceMappingURL=vin-explainer.service.js.map