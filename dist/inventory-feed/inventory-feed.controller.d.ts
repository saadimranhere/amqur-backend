import { InventoryFeedService } from './inventory-feed.service';
import { ParseInventoryFeedDto } from './dto/parse-inventory-feed.dto';
export declare class InventoryFeedController {
    private readonly feed;
    constructor(feed: InventoryFeedService);
    parse(body: ParseInventoryFeedDto): Promise<{
        count: number;
        sample: {
            vin: any;
            stock: any;
            year: number;
            make: any;
            model: any;
            trim: any;
            price: number;
            msrp: number;
            mileage: number;
            color: any;
            locationId: any;
            status: any;
        }[];
    }>;
}
