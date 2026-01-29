import { MediaAdapter, VehicleMedia } from './media.adapter';
export declare class StellantisAdapter implements MediaAdapter {
    supports(make: string): boolean;
    fetch(vin: string): Promise<VehicleMedia>;
}
