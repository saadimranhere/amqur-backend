"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadExtractor = void 0;
const common_1 = require("@nestjs/common");
let LeadExtractor = class LeadExtractor {
    extract(text) {
        const result = {};
        const phoneMatch = text.match(/(\+1)?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
            result.phone = phoneMatch[0].replace(/[^\d]/g, '');
        }
        const emailMatch = text.match(/[^\s]+@[^\s]+\.[^\s]+/);
        if (emailMatch) {
            result.email = emailMatch[0];
        }
        const clean = text.trim();
        if (!phoneMatch &&
            !emailMatch &&
            clean.split(' ').length <= 3 &&
            /^[a-zA-Z\s]+$/.test(clean)) {
            const parts = clean.split(' ');
            result.firstName = capitalize(parts[0]);
            if (parts.length > 1) {
                result.lastName = capitalize(parts.slice(1).join(' '));
            }
        }
        return result;
    }
};
exports.LeadExtractor = LeadExtractor;
exports.LeadExtractor = LeadExtractor = __decorate([
    (0, common_1.Injectable)()
], LeadExtractor);
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
//# sourceMappingURL=lead-extractor.js.map