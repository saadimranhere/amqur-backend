import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { parse } from 'csv-parse/sync';

@Injectable()
export class InventoryFeedService {
  private readonly logger = new Logger(InventoryFeedService.name);

  async fetchFeed(url: string): Promise<string> {
    // Controller enforces allowlist; these limits reduce blast radius.
    const response = await axios.get(url, {
      timeout: 30_000,
      maxRedirects: 0,
      responseType: 'text',

      maxContentLength: 25 * 1024 * 1024,
      maxBodyLength: 25 * 1024 * 1024,

      validateStatus: (status) => status >= 200 && status < 300,

      headers: {
        'User-Agent': 'amqur-inventory-feed/1.0',
        Accept: 'application/xml, text/xml, application/json, text/plain, */*',
      },
    });


    return response.data;
  }

  parseFeed(type: 'XML' | 'JSON' | 'CSV', raw: string): any[] {
    switch (type) {
      case 'XML':
        return this.parseXml(raw);

      case 'JSON': {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : parsed?.vehicles ?? parsed?.inventory ?? [];
      }

      case 'CSV':
        return this.parseCsv(raw);

      default:
        throw new Error(`Unsupported feed type: ${type}`);
    }
  }

  private parseXml(xml: string): any[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });

    const json = parser.parse(xml);

    return (
      json?.inventory?.vehicle ??
      json?.inventory?.vehicles?.vehicle ??
      json?.vehicles?.vehicle ??
      json?.vehicleList?.vehicle ??
      json?.['vehicle-list']?.vehicle ??
      []
    );
  }

  private parseCsv(csv: string): any[] {
    return parse(csv, {
      columns: true,
      skip_empty_lines: true,
    });
  }
}
