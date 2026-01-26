import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { VinProfile } from './vin.types';

@Injectable()
export class VinDecoderService {
    async decode(vin: string): Promise<VinProfile> {
        const url =
            `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`;

        const res = await axios.get(url);

        const map: Record<string, string> = {};

        for (const row of res.data.Results) {
            if (row.Variable && row.Value) {
                map[row.Variable] = row.Value;
            }
        }

        return {
            vin,
            year: Number(map['Model Year']) || undefined,
            make: map['Make'],
            model: map['Model'],
            trim: map['Trim'],

            bodyType: map['Body Class'],
            doors: Number(map['Doors']) || undefined,

            engine: map['Engine Model'] || map['Engine Configuration'],
            transmission: map['Transmission Style'],
            drivetrain: map['Drive Type'],
            fuelType: map['Fuel Type - Primary'],
        };
    }
}
