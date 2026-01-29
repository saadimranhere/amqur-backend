export declare class MediaEngine {
    private adapters;
    enrich(make: string, vin: string): Promise<import("./media.adapter").VehicleMedia>;
}
