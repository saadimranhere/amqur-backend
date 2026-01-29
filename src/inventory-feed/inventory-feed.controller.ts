import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Post,
    UseGuards,
} from '@nestjs/common';
import { InventoryFeedService } from './inventory-feed.service';
import { VehicleNormalizer } from './normalizer/vehicle.normalizer';
import { ParseInventoryFeedDto } from './dto/parse-inventory-feed.dto';

function isHostAllowed(hostname: string): boolean {
    const raw = process.env.INVENTORY_FEED_ALLOWED_HOSTS ?? '';
    const allowed = raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

    // Safe-by-default: if you didn't explicitly allow hosts, we don't fetch.
    if (allowed.length === 0) return false;

    const host = hostname.toLowerCase();
    return allowed.includes(host);
}

@Controller('inventory-feed')
export class InventoryFeedController {
    constructor(private readonly feed: InventoryFeedService) { }

    @Post('parse')
    async parse(@Body() body: ParseInventoryFeedDto) {
        let url: URL;

        try {
            url = new URL(body.url);
        } catch {
            throw new BadRequestException('Invalid URL');
        }

        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new BadRequestException('Only http/https URLs are allowed');
        }

        if (!isHostAllowed(url.hostname)) {
            throw new ForbiddenException('Feed host is not allowed');
        }

        const raw = await this.feed.fetchFeed(url.toString());
        const records = this.feed.parseFeed(body.type, raw);
        const vehicles = records.map(VehicleNormalizer.normalize);

        return {
            count: vehicles.length,
            sample: vehicles.slice(0, 3),
        };
    }
}
