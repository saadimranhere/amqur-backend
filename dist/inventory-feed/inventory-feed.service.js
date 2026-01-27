"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var InventoryFeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryFeedService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fast_xml_parser_1 = require("fast-xml-parser");
const sync_1 = require("csv-parse/sync");
let InventoryFeedService = InventoryFeedService_1 = class InventoryFeedService {
    logger = new common_1.Logger(InventoryFeedService_1.name);
    async fetchFeed(url) {
        const response = await axios_1.default.get(url, {
            timeout: 10_000,
            maxRedirects: 0,
            responseType: 'text',
            maxContentLength: 5 * 1024 * 1024,
            maxBodyLength: 5 * 1024 * 1024,
            validateStatus: (status) => status >= 200 && status < 300,
            headers: {
                'User-Agent': 'amqur-inventory-feed/1.0',
                Accept: 'application/xml, text/xml, application/json, text/plain, */*',
            },
        });
        return response.data;
    }
    parseFeed(type, raw) {
        switch (type) {
            case 'XML':
                return this.parseXml(raw);
            case 'JSON':
                return JSON.parse(raw);
            case 'CSV':
                return this.parseCsv(raw);
            default:
                throw new Error(`Unsupported feed type: ${type}`);
        }
    }
    parseXml(xml) {
        const parser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
        });
        const json = parser.parse(xml);
        return json?.inventory?.vehicle ?? json?.vehicles?.vehicle ?? [];
    }
    parseCsv(csv) {
        return (0, sync_1.parse)(csv, {
            columns: true,
            skip_empty_lines: true,
        });
    }
};
exports.InventoryFeedService = InventoryFeedService;
exports.InventoryFeedService = InventoryFeedService = InventoryFeedService_1 = __decorate([
    (0, common_1.Injectable)()
], InventoryFeedService);
//# sourceMappingURL=inventory-feed.service.js.map