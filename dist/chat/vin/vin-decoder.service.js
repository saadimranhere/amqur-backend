"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VinDecoderService = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@nestjs/common");
let VinDecoderService = class VinDecoderService {
    async decode(vin) {
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`;
        const res = await axios_1.default.get(url);
        const map = {};
        for (const row of res.data.Results) {
            if (row.Variable && row.Value) {
                map[row.Variable] = row.Value;
            }
        }
        return {
            vin,
            year: Number(map['Model Year']) || undefined,
            make: map['Make'],
            model: map['Model'],
            trim: map['Trim'],
            bodyType: map['Body Class'],
            doors: Number(map['Doors']) || undefined,
            engine: map['Engine Model'] || map['Engine Configuration'],
            transmission: map['Transmission Style'],
            drivetrain: map['Drive Type'],
            fuelType: map['Fuel Type - Primary'],
        };
    }
};
exports.VinDecoderService = VinDecoderService;
exports.VinDecoderService = VinDecoderService = __decorate([
    (0, common_1.Injectable)()
], VinDecoderService);
//# sourceMappingURL=vin-decoder.service.js.map