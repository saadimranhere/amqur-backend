"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryExtractor = void 0;
class InventoryExtractor {
    static extract(text) {
        const msg = text.toLowerCase();
        const resetAll = /start over|reset|clear|new search|forget/.test(msg);
        const remove = [];
        if (/any color|all colors/.test(msg))
            remove.push('color');
        if (/any price|no budget|remove price/.test(msg))
            remove.push('maxPrice');
        if (/any year|no year limit/.test(msg))
            remove.push('year');
        const yearMatch = msg.match(/\b(20[0-2][0-9])\b/);
        const year = yearMatch ? Number(yearMatch[1]) : undefined;
        const priceMatch = msg.match(/\b(under|below|less than)\s*\$?\s*(\d{2,6})(k)?\b/);
        let maxPrice;
        if (priceMatch) {
            const raw = Number(priceMatch[2]);
            maxPrice = priceMatch[3] ? raw * 1000 : raw;
        }
        const colors = ['black', 'white', 'silver', 'gray', 'red', 'blue'];
        const color = colors.find(c => msg.includes(c));
        let drivetrain;
        if (msg.includes('4x4') || msg.includes('four wheel'))
            drivetrain = '4x4';
        if (msg.includes('awd'))
            drivetrain = 'AWD';
        if (msg.includes('fwd'))
            drivetrain = 'FWD';
        if (msg.includes('rwd'))
            drivetrain = 'RWD';
        let bodyType;
        if (msg.includes('suv'))
            bodyType = 'SUV';
        if (msg.includes('truck'))
            bodyType = 'Truck';
        if (msg.includes('sedan'))
            bodyType = 'Sedan';
        let sortBy;
        if (msg.includes('cheapest'))
            sortBy = 'price_asc';
        if (msg.includes('most expensive'))
            sortBy = 'price_desc';
        const cleaned = msg
            .replace(/\b(under|below|less than)\s*\$?\s*\d{2,6}k?\b/g, '')
            .replace(/\b(cheapest|only|just|show me)\b/g, '')
            .trim();
        const patch = {
            query: undefined,
            year,
            maxPrice,
            color,
            drivetrain,
            bodyType,
            sortBy,
        };
        if (cleaned &&
            !/only|under|color|price|door|awd|fwd|rwd/.test(cleaned)) {
            patch.query = cleaned;
        }
        return {
            patch,
            remove,
            resetAll,
        };
    }
    static toStatePatch(update) {
        if (update.resetAll) {
            return {};
        }
        const result = {
            ...update.patch,
        };
        for (const key of update.remove) {
            delete result[key];
        }
        return result;
    }
}
exports.InventoryExtractor = InventoryExtractor;
//# sourceMappingURL=inventory.extractor.js.map