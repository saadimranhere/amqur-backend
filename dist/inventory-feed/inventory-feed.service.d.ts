export declare class InventoryFeedService {
    private readonly logger;
    fetchFeed(url: string): Promise<string>;
    parseFeed(type: 'XML' | 'JSON' | 'CSV', raw: string): any[];
    private parseXml;
    private parseCsv;
}
