import { MediaAdapter, VehicleMedia } from './media.adapter';
export declare class ImaginAdapter implements MediaAdapter {
    supports(): boolean;
    fetch(vin: string): Promise<VehicleMedia>;
}
