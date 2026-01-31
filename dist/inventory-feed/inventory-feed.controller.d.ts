import { InventoryFeedService } from './inventory-feed.service';
import { ParseInventoryFeedDto } from './dto/parse-inventory-feed.dto';
export declare class InventoryFeedController {
    private readonly feed;
    constructor(feed: InventoryFeedService);
    parse(body: ParseInventoryFeedDto): Promise<{
        count: number;
        sample: {
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
        }[];
    }>;
}
