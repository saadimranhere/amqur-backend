export declare class PaymentEngine {
    calculateMonthlyPayment(input: {
        price: number;
        apr?: number;
        term?: number;
        taxRate?: number;
        docFee?: number;
        downPayment?: number;
    }): number;
}
