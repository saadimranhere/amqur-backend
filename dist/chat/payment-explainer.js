"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentExplainer = void 0;
const common_1 = require("@nestjs/common");
let PaymentExplainer = class PaymentExplainer {
    explain(params) {
        const term = params.termMonths ?? 72;
        const apr = params.apr ?? 6.9;
        const down = params.downPayment ?? 0;
        const parts = [];
        parts.push(`This estimate is based on a ${term}-month loan at about ${apr}% APR.`);
        if (down > 0) {
            parts.push(`It assumes roughly $${down.toLocaleString()} down.`);
        }
        else {
            parts.push(`No down payment was included.`);
        }
        parts.push(`That puts the payment around $${params.estimatedPayment}/month before taxes and fees.`);
        parts.push(`Lowering the term, increasing the down payment, or qualifying for a lower APR would reduce the monthly payment.`);
        return parts.join(' ');
    }
};
exports.PaymentExplainer = PaymentExplainer;
exports.PaymentExplainer = PaymentExplainer = __decorate([
    (0, common_1.Injectable)()
], PaymentExplainer);
//# sourceMappingURL=payment-explainer.js.map