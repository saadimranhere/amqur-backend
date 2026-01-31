type NormalizedVehicle = {
    vin: string;
    stock?: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    bodyType?: string;
    drivetrain?: string;
    transmission?: string;
    fuelType?: string;
    color?: string;
    price?: number;
    msrp?: number;
    mileage?: number;
    photos?: string[];
};
export declare class VehicleNormalizer {
    static normalize(raw: any): NormalizedVehicle | null;
}
export {};
