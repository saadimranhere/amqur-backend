"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentDetector = void 0;
const intent_types_1 = require("./intent.types");
class IntentDetector {
    static detect(message) {
        const text = message.toLowerCase();
        if (text.startsWith('what is') ||
            text.startsWith('how does') ||
            text.startsWith('how do') ||
            text.startsWith('why') ||
            text.startsWith('explain') ||
            text.includes('difference between')) {
            return intent_types_1.ChatIntent.INTELLIGENT_QUERY;
        }
        if (text.includes('monthly') ||
            text.includes('per month') ||
            text.includes('a month') ||
            text.includes('payment') ||
            text.includes('finance') ||
            text.includes('apr') ||
            text.includes('down') ||
            text.match(/\b(36|48|60|72|84)\b/)) {
            return intent_types_1.ChatIntent.PAYMENT_ESTIMATE;
        }
        const inventoryKeywords = [
            'jeep',
            'jeeps',
            'wrangler',
            'cherokee',
            'grand cherokee',
            'compass',
            'renegade',
            'truck',
            'suv',
            'car',
            'vehicle',
            'inventory',
            'available',
            'buy',
            'looking for',
            'want',
            'search',
        ];
        if (inventoryKeywords.some(k => text.includes(k))) {
            return intent_types_1.ChatIntent.INVENTORY_SEARCH;
        }
        if (text.includes('hold') ||
            text.includes('reserve') ||
            text.includes('lock this')) {
            return intent_types_1.ChatIntent.HOLD_VEHICLE;
        }
        if (text.includes('price') ||
            text.includes('how much') ||
            text.includes('cost')) {
            return intent_types_1.ChatIntent.PRICING_REQUEST;
        }
        if (text.includes('service') ||
            text.includes('oil') ||
            text.includes('appointment')) {
            return intent_types_1.ChatIntent.SERVICE_APPOINTMENT;
        }
        if (text.includes('hours') ||
            text.includes('open') ||
            text.includes('location') ||
            text.includes('address')) {
            return intent_types_1.ChatIntent.HOURS_LOCATION;
        }
        if (text.includes('human') ||
            text.includes('sales') ||
            text.includes('representative') ||
            text.includes('agent')) {
            return intent_types_1.ChatIntent.HUMAN_HANDOFF;
        }
        return intent_types_1.ChatIntent.GENERAL_QUESTION;
    }
}
exports.IntentDetector = IntentDetector;
//# sourceMappingURL=intent.detector.js.map