"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleNormalizer = void 0;
class VehicleNormalizer {
    static normalize(raw) {
        return {
            vin: raw.vin || raw.VIN,
            stock: raw.stock || raw.StockNumber,
            year: Number(raw.year || raw.Year),
            make: raw.make || raw.Make,
            model: raw.model || raw.Model,
            trim: raw.trim || raw.Trim,
            price: Number(raw.price || raw.Price),
            msrp: Number(raw.msrp || raw.MSRP),
            mileage: Number(raw.mileage || raw.Miles),
            color: raw.color || raw.Color,
            locationId: raw.locationId ?? null,
            status: raw.status ?? 'AVAILABLE',
        };
    }
}
exports.VehicleNormalizer = VehicleNormalizer;
//# sourceMappingURL=vehicle.normalizer.js.map