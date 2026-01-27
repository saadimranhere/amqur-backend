export type FinanceEstimateInput = {
    price: number;
    termMonths: number;
    apr: number;
    downPayment?: number;
    tradeIn?: number;
    fees?: number;
    taxRate?: number;
    taxOn?: 'price' | 'net';
};
export type FinanceEstimateOutput = {
    amountFinanced: number;
    monthlyPayment: number;
    totalPaid: number;
    totalInterest: number;
    breakdown: {
        price: number;
        downPayment: number;
        tradeIn: number;
        fees: number;
        taxRate: number;
        taxAmount: number;
        apr: number;
        termMonths: number;
    };
};
export declare class PaymentService {
    private DEFAULT_TERM;
    private DEFAULT_APR;
    private DEFAULT_FEES;
    private DEFAULT_TAX_RATE;
    private DEFAULT_TAX_ON;
    estimateFinance(input: FinanceEstimateInput): FinanceEstimateOutput;
    private monthlyPayment;
    private money;
    private clamp;
    private clampInt;
}
