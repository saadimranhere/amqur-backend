export declare class PaymentExplainer {
    explain(params: {
        price: number;
        estimatedPayment: number;
        downPayment?: number;
        apr?: number;
        termMonths?: number;
    }): string;
}
