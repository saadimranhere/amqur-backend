"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImaginAdapter = void 0;
class ImaginAdapter {
    supports() {
        return true;
    }
    async fetch(vin) {
        return {
            photos: [
                `https://cdn.imagin.studio/getimage?customer=demo&vin=${vin}&angle=01`,
                `https://cdn.imagin.studio/getimage?customer=demo&vin=${vin}&angle=05`,
                `https://cdn.imagin.studio/getimage?customer=demo&vin=${vin}&angle=09`,
            ],
            windowStickerUrl: `https://windowstickerlookup.com/sticker/${vin}`,
        };
    }
}
exports.ImaginAdapter = ImaginAdapter;
//# sourceMappingURL=imagin.adapter.js.map