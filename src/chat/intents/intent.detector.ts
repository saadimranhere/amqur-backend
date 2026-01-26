import { ChatIntent } from './intent.types';

export class IntentDetector {
    static detect(message: string): ChatIntent {
        const text = message.toLowerCase();
        // 🧠 Intelligent-mode questions (non-inventory reasoning)
        if (
            text.startsWith('what is') ||
            text.startsWith('how does') ||
            text.startsWith('how do') ||
            text.startsWith('why') ||
            text.startsWith('explain') ||
            text.includes('difference between')
        ) {
            return ChatIntent.INTELLIGENT_QUERY;
        }
        // 💳 Payment / finance intent
        if (
            text.includes('monthly') ||
            text.includes('per month') ||
            text.includes('a month') ||
            text.includes('payment') ||
            text.includes('finance') ||
            text.includes('apr') ||
            text.includes('down') ||
            text.match(/\b(36|48|60|72|84)\b/)
        ) {
            return ChatIntent.PAYMENT_ESTIMATE;
        }
        // 🔹 Inventory search keywords
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
            return ChatIntent.INVENTORY_SEARCH;
        }
        if (
            text.includes('hold') ||
            text.includes('reserve') ||
            text.includes('lock this')
        ) {
            return ChatIntent.HOLD_VEHICLE;
        }

        if (
            text.includes('price') ||
            text.includes('how much') ||
            text.includes('cost')
        ) {
            return ChatIntent.PRICING_REQUEST;
        }

        if (
            text.includes('service') ||
            text.includes('oil') ||
            text.includes('appointment')
        ) {
            return ChatIntent.SERVICE_APPOINTMENT;
        }

        if (
            text.includes('hours') ||
            text.includes('open') ||
            text.includes('location') ||
            text.includes('address')
        ) {
            return ChatIntent.HOURS_LOCATION;
        }

        if (
            text.includes('human') ||
            text.includes('sales') ||
            text.includes('representative') ||
            text.includes('agent')
        ) {
            return ChatIntent.HUMAN_HANDOFF;
        }

        return ChatIntent.GENERAL_QUESTION;
    }
}
