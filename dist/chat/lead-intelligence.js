"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreLeadEvent = scoreLeadEvent;
exports.stageFromScore = stageFromScore;
function scoreLeadEvent(currentScore, event) {
    const weights = {
        inventory_search: 1,
        vehicle_view: 2,
        compare: 2,
        pricing: 2,
        payment: 3,
        appointment: 5,
        hold: 6,
        human: 10,
    };
    return currentScore + (weights[event] ?? 0);
}
function stageFromScore(score) {
    if (score >= 12)
        return 'hot';
    if (score >= 6)
        return 'warm';
    return 'cold';
}
//# sourceMappingURL=lead-intelligence.js.map