"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMinutes = toMinutes;
function toMinutes(time) {
    const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!match)
        return -1;
    let hour = Number(match[1]);
    const min = Number(match[2]);
    const suffix = match[3].toUpperCase();
    if (suffix === 'PM' && hour !== 12)
        hour += 12;
    if (suffix === 'AM' && hour === 12)
        hour = 0;
    return hour * 60 + min;
}
//# sourceMappingURL=time-utils.js.map