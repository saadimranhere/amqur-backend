import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Post,
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

    // Safe-by-default
    if (allowed.length === 0) return false;

    return allowed.includes(hostname.toLowerCase());
}

@Controller('inventory-feed')
export class InventoryFeedController {
    constructor(private readonly feed: InventoryFeedService) { }

    @Post('parse')
    async parse(@Body() body: ParseInventoryFeedDto) {
        let url: URL;

        // ───────────────────────────────
        // URL validation
        // ───────────────────────────────
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

        // ───────────────────────────────
        // Fetch raw feed
        // ───────────────────────────────
        const raw = await this.feed.fetchFeed(url.toString());

        // ───────────────────────────────
        // Parse feed
        // ───────────────────────────────
        const records = this.feed.parseFeed(body.type, raw);

        // ✅ FIX #3 — prevent 500 crashes
        if (!Array.isArray(records)) {
            throw new BadRequestException(
                'Feed parsed successfully but no vehicle array was found. Please verify feed structure.',
            );
        }

        // ───────────────────────────────
        // Normalize + filter invalid rows
        // ───────────────────────────────
        const vehicles = records
            .map((record) => VehicleNormalizer.normalize(record))
            .filter((v) => v !== null);

        return {
            count: vehicles.length,
            sample: vehicles.slice(0, 3),
        };
    }
}
