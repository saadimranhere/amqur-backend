export type LeadExtractResult = {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
};
export declare class LeadExtractor {
    extract(text: string): LeadExtractResult;
}
