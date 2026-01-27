"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDate = normalizeDate;
function normalizeDate(input, timezone = 'America/Chicago') {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    const lower = input.toLowerCase();
    if (lower === 'today') {
        return iso(now);
    }
    if (lower === 'tomorrow') {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return iso(d);
    }
    const weekdays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    const idx = weekdays.indexOf(lower);
    if (idx !== -1) {
        const d = new Date(now);
        const diff = (idx + 7 - d.getDay()) % 7 || 7;
        d.setDate(d.getDate() + diff);
        return iso(d);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return input;
    }
    return undefined;
}
function iso(d) {
    return d.toISOString().split('T')[0];
}
//# sourceMappingURL=date-normalizer.js.map