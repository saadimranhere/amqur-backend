"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEngine = void 0;
const common_1 = require("@nestjs/common");
let PaymentEngine = class PaymentEngine {
    calculateMonthlyPayment(input) {
        const { price, apr = 6.99, term = 72, taxRate = 0.095, docFee = 358, downPayment = 0, } = input;
        const taxableAmount = price + docFee - downPayment;
        const taxedTotal = taxableAmount * (1 + taxRate);
        const monthlyRate = apr / 100 / 12;
        const payment = (taxedTotal * monthlyRate) /
            (1 - Math.pow(1 + monthlyRate, -term));
        return Math.round(payment);
    }
};
exports.PaymentEngine = PaymentEngine;
exports.PaymentEngine = PaymentEngine = __decorate([
    (0, common_1.Injectable)()
], PaymentEngine);
//# sourceMappingURL=payment.engine.js.map