import { VinProfile } from './vin.types';
export declare class VinDecoderService {
    decode(vin: string): Promise<VinProfile>;
}
