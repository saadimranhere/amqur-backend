"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VinExtractor = void 0;
const common_1 = require("@nestjs/common");
let VinExtractor = class VinExtractor {
    extract(text, visibleVins) {
        const lower = text.toLowerCase();
        const vinMatch = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
        if (vinMatch)
            return vinMatch[0];
        if (lower.includes('first'))
            return visibleVins[0];
        if (lower.includes('second'))
            return visibleVins[1];
        if (lower.includes('third'))
            return visibleVins[2];
        if (lower.includes('this one') ||
            lower.includes('that one')) {
            return visibleVins[0];
        }
        return null;
    }
};
exports.VinExtractor = VinExtractor;
exports.VinExtractor = VinExtractor = __decorate([
    (0, common_1.Injectable)()
], VinExtractor);
//# sourceMappingURL=vin-extractor.js.map