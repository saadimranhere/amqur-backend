export type InventoryPatch = {
    query?: string;
    year?: number;
    maxPrice?: number;
    maxMonthlyPayment?: number;
    color?: string;
    drivetrain?: string;
    bodyType?: string;
    sortBy?: 'price_asc' | 'price_desc';
};
export type InventoryUpdate = {
    patch: InventoryPatch;
    remove: (keyof InventoryPatch)[];
    resetAll: boolean;
};
export declare class InventoryExtractor {
    static extract(text: string): InventoryUpdate;
    static toStatePatch(update: InventoryUpdate): Partial<InventoryPatch>;
}
