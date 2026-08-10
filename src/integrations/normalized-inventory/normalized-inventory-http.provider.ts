import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { assertFeedUrlAllowed } from '../../common/security/feed-url.guard';
import { VehicleNormalizer } from '../../inventory-feed/normalizer/vehicle.normalizer';
import type {
  InventoryFeedFormat,
  InventoryFeedProvider,
  InventoryFeedSnapshot,
  InventoryFeedValidationResult,
} from '../core/inventory-feed.provider';

const FETCH_TIMEOUT_MS = 30_000;
const MAX_BYTES = 25 * 1024 * 1024;

type NormalizedInventoryRecord = {
  vin: string;
  year: number;
  make: string;
  model: string;
  [key: string]: unknown;
};

@Injectable()
export class NormalizedInventoryHttpProvider implements InventoryFeedProvider {
  readonly providerId = 'normalized_inventory_http';
  private readonly logger = new Logger(NormalizedInventoryHttpProvider.name);

  isLiveConfigured(): boolean {
    return true;
  }

  async healthCheck(): Promise<{ ok: boolean; detail?: string }> {
    return { ok: true, detail: 'normalized_http_ready' };
  }

  async fetchSnapshot(params: {
    tenantId: string;
    locationId: string;
    url?: string | null;
    format?: InventoryFeedFormat | null;
  }): Promise<InventoryFeedSnapshot> {
    if (!params.url) {
      throw new Error('Normalized inventory HTTP feed URL not configured');
    }
    assertFeedUrlAllowed(params.url);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(params.url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`Feed fetch failed: HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > MAX_BYTES) {
        throw new Error(`Feed exceeds max size of ${MAX_BYTES} bytes`);
      }
      const raw = buf.toString('utf8');
      const checksum = createHash('sha256').update(raw).digest('hex');
      return {
        provider: this.providerId,
        transport: 'HTTPS',
        format: 'JSON',
        sourceIdentifier: params.url,
        checksum,
        fetchedAt: new Date().toISOString(),
        raw,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private parseJsonArray(raw: string): NormalizedInventoryRecord[] {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error('Normalized inventory feed must be a JSON array');
    }
    return parsed as NormalizedInventoryRecord[];
  }

  private validateRecord(
    record: unknown,
    index: number,
  ): NormalizedInventoryRecord | null {
    if (!record || typeof record !== 'object') return null;
    const r = record as Record<string, unknown>;
    const vin = String(r.vin ?? '').trim();
    const year = Number(r.year);
    const make = String(r.make ?? '').trim();
    const model = String(r.model ?? '').trim();
    if (!vin || !Number.isFinite(year) || !make || !model) {
      this.logger.warn(`Record ${index} missing required VIN/year/make/model`);
      return null;
    }
    return { ...r, vin, year, make, model } as NormalizedInventoryRecord;
  }

  async validateAndNormalize(
    snapshot: InventoryFeedSnapshot,
    opts: { minRecords: number; previousCount?: number | null },
  ): Promise<InventoryFeedValidationResult> {
    const anomalies: string[] = [];
    let records: NormalizedInventoryRecord[] = [];
    try {
      records = this.parseJsonArray(snapshot.raw.toString());
    } catch (e) {
      anomalies.push(`invalid_json:${(e as Error).message}`);
      return {
        ok: false,
        recordCount: 0,
        validCount: 0,
        rejectedCount: 0,
        anomalies,
        vehicles: [],
      };
    }

    const validated = records
      .map((r, i) => this.validateRecord(r, i))
      .filter((r): r is NormalizedInventoryRecord => r !== null);

    const vehicles = validated
      .map((r) => VehicleNormalizer.normalize(r))
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .map((v) => ({ ...v, source: this.providerId }));

    const recordCount = records.length;
    const validCount = vehicles.length;
    const rejectedCount = recordCount - validCount;

    if (validCount < opts.minRecords) {
      anomalies.push(`below_min_records:${validCount}<${opts.minRecords}`);
    }
    if (validCount === 0) {
      anomalies.push('empty_normalized_inventory');
    }
    if (
      opts.previousCount != null &&
      opts.previousCount > 20 &&
      validCount < Math.floor(opts.previousCount * 0.2)
    ) {
      anomalies.push(
        `size_drop_anomaly:prev=${opts.previousCount},now=${validCount}`,
      );
    }

    const ok = anomalies.length === 0;
    return {
      ok,
      recordCount,
      validCount,
      rejectedCount,
      anomalies,
      vehicles: ok ? vehicles : [],
    };
  }
}
