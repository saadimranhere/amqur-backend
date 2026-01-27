"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoEnrichmentService = void 0;
const common_1 = require("@nestjs/common");
let PhotoEnrichmentService = class PhotoEnrichmentService {
    enrich(vehicle) {
        if (Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
            return vehicle;
        }
        const base = 'https://cdn.imagin.studio/getimage';
        const params = new URLSearchParams({
            customer: 'usdemo',
            make: vehicle.make,
            model: vehicle.model,
            angle: '01',
            width: '800',
        });
        return {
            ...vehicle,
            photos: [
                `${base}?${params.toString()}`,
                `${base}?${params.toString()}&angle=02`,
                `${base}?${params.toString()}&angle=03`,
            ],
        };
    }
};
exports.PhotoEnrichmentService = PhotoEnrichmentService;
exports.PhotoEnrichmentService = PhotoEnrichmentService = __decorate([
    (0, common_1.Injectable)()
], PhotoEnrichmentService);
//# sourceMappingURL=photo-enrichment.service.js.map