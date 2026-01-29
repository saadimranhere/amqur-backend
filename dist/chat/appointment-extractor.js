"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentExtractor = void 0;
const common_1 = require("@nestjs/common");
let AppointmentExtractor = class AppointmentExtractor {
    wantsScheduling(text) {
        const m = text.toLowerCase();
        return (m.includes('schedule') ||
            m.includes('test drive') ||
            m.includes('test-drive') ||
            m.includes('book') ||
            m.includes('appointment') ||
            m.includes('come in') ||
            m.includes('visit'));
    }
    extractDate(text) {
        const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
        if (iso)
            return iso[0];
        const us = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/);
        if (us) {
            const mm = us[1].padStart(2, '0');
            const dd = us[2].padStart(2, '0');
            let yy = us[3];
            if (yy.length === 2)
                yy = `20${yy}`;
            return `${yy}-${mm}-${dd}`;
        }
        return undefined;
    }
    extractTime(text) {
        const m = text.toLowerCase();
        const ampm = m.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/);
        if (ampm) {
            const h = Number(ampm[1]);
            const min = ampm[2] ?? '00';
            const suffix = ampm[3].toUpperCase();
            return `${h}:${min} ${suffix}`;
        }
        const military = m.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
        if (military) {
            let hour = Number(military[1]);
            const min = military[2];
            const suffix = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12;
            if (hour === 0)
                hour = 12;
            return `${hour}:${min} ${suffix}`;
        }
        return undefined;
    }
};
exports.AppointmentExtractor = AppointmentExtractor;
exports.AppointmentExtractor = AppointmentExtractor = __decorate([
    (0, common_1.Injectable)()
], AppointmentExtractor);
//# sourceMappingURL=appointment-extractor.js.map