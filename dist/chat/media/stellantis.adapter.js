"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StellantisAdapter = void 0;
class StellantisAdapter {
    supports(make) {
        return ['jeep', 'ram', 'dodge', 'chrysler'].includes(make.toLowerCase());
    }
    async fetch(vin) {
        return {
            windowStickerUrl: `https://www.jeep.com/hostd/windowsticker/getWindowStickerPdf.do?vin=${vin}`,
        };
    }
}
exports.StellantisAdapter = StellantisAdapter;
//# sourceMappingURL=stellantis.adapter.js.map