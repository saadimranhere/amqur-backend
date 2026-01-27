"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyInventoryUpdate = applyInventoryUpdate;
function applyInventoryUpdate(current, update) {
    if (update.resetAll) {
        return {
            lead: {},
            appointment: {},
        };
    }
    const next = {
        ...current,
    };
    for (const key of update.remove) {
        delete next[key];
    }
    for (const [key, value] of Object.entries(update.patch)) {
        if (value !== undefined) {
            next[key] = value;
        }
    }
    return next;
}
//# sourceMappingURL=inventory.merge.js.map