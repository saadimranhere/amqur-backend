"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentService = void 0;
const common_1 = require("@nestjs/common");
let IntelligentService = class IntelligentService {
    async answer(params) {
        return (`I understand your question:\n\n` +
            `"${params.question}"\n\n` +
            `This feature is currently being prepared.`);
    }
};
exports.IntelligentService = IntelligentService;
exports.IntelligentService = IntelligentService = __decorate([
    (0, common_1.Injectable)()
], IntelligentService);
//# sourceMappingURL=intelligent.service.js.map