"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryFeedController = void 0;
const common_1 = require("@nestjs/common");
const inventory_feed_service_1 = require("./inventory-feed.service");
const vehicle_normalizer_1 = require("./normalizer/vehicle.normalizer");
const parse_inventory_feed_dto_1 = require("./dto/parse-inventory-feed.dto");
function isHostAllowed(hostname) {
    const raw = process.env.INVENTORY_FEED_ALLOWED_HOSTS ?? '';
    const allowed = raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    if (allowed.length === 0)
        return false;
    return allowed.includes(hostname.toLowerCase());
}
let InventoryFeedController = class InventoryFeedController {
    feed;
    constructor(feed) {
        this.feed = feed;
    }
    async parse(body) {
        let url;
        try {
            url = new URL(body.url);
        }
        catch {
            throw new common_1.BadRequestException('Invalid URL');
        }
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new common_1.BadRequestException('Only http/https URLs are allowed');
        }
        if (!isHostAllowed(url.hostname)) {
            throw new common_1.ForbiddenException('Feed host is not allowed');
        }
        const raw = await this.feed.fetchFeed(url.toString());
        const records = this.feed.parseFeed(body.type, raw);
        if (!Array.isArray(records)) {
            throw new common_1.BadRequestException('Feed parsed successfully but no vehicle array was found. Please verify feed structure.');
        }
        const vehicles = records
            .map((record) => vehicle_normalizer_1.VehicleNormalizer.normalize(record))
            .filter((v) => v !== null);
        return {
            count: vehicles.length,
            sample: vehicles.slice(0, 3),
        };
    }
};
exports.InventoryFeedController = InventoryFeedController;
__decorate([
    (0, common_1.Post)('parse'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [parse_inventory_feed_dto_1.ParseInventoryFeedDto]),
    __metadata("design:returntype", Promise)
], InventoryFeedController.prototype, "parse", null);
exports.InventoryFeedController = InventoryFeedController = __decorate([
    (0, common_1.Controller)('inventory-feed'),
    __metadata("design:paramtypes", [inventory_feed_service_1.InventoryFeedService])
], InventoryFeedController);
//# sourceMappingURL=inventory-feed.controller.js.map