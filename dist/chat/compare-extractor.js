"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareExtractor = void 0;
class CompareExtractor {
    extract(text, visibleVins) {
        const lower = text.toLowerCase();
        const vins = [];
        if (lower.includes('first'))
            vins.push(visibleVins[0]);
        if (lower.includes('second'))
            vins.push(visibleVins[1]);
        if (lower.includes('third'))
            vins.push(visibleVins[2]);
        if (lower.includes('compare all')) {
            return visibleVins.slice(0, 3);
        }
        return vins.filter(Boolean);
    }
}
exports.CompareExtractor = CompareExtractor;
//# sourceMappingURL=compare-extractor.js.map