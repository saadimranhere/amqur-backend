"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaEngine = void 0;
const common_1 = require("@nestjs/common");
const stellantis_adapter_1 = require("./stellantis.adapter");
const imagin_adapter_1 = require("./imagin.adapter");
let MediaEngine = class MediaEngine {
    adapters = [
        new stellantis_adapter_1.StellantisAdapter(),
        new imagin_adapter_1.ImaginAdapter(),
    ];
    async enrich(make, vin) {
        const adapter = this.adapters.find(a => a.supports(make)) ??
            this.adapters[this.adapters.length - 1];
        return adapter.fetch(vin);
    }
};
exports.MediaEngine = MediaEngine;
exports.MediaEngine = MediaEngine = __decorate([
    (0, common_1.Injectable)()
], MediaEngine);
//# sourceMappingURL=media.engine.js.map