export declare class PaymentExtractor {
    static extract(message: string): {
        maxMonthlyPayment: number | undefined;
        termMonths: number | undefined;
        downPayment: number | undefined;
        apr: number | undefined;
        tradeIn: undefined;
    };
}
