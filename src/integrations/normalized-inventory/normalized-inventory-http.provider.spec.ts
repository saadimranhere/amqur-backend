import { NormalizedInventoryHttpProvider } from './normalized-inventory-http.provider';

describe('NormalizedInventoryHttpProvider', () => {
  const provider = new NormalizedInventoryHttpProvider();
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.INVENTORY_FEED_ALLOWED_HOSTS;
  });

  it('fetches and validates JSON array feed', async () => {
    process.env.INVENTORY_FEED_ALLOWED_HOSTS = 'feeds.example.com';
    const payload = JSON.stringify([
      {
        vin: '1C4RJFBG0JC123456',
        year: 2024,
        make: 'Jeep',
        model: 'Wrangler',
        price: 42000,
      },
    ]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => Buffer.from(payload),
    }) as typeof fetch;

    const snapshot = await provider.fetchSnapshot({
      tenantId: 't1',
      locationId: 'l1',
      url: 'https://feeds.example.com/inventory.json',
      format: 'JSON',
    });
    expect(snapshot.provider).toBe('normalized_inventory_http');
    expect(snapshot.format).toBe('JSON');

    const result = await provider.validateAndNormalize(snapshot, {
      minRecords: 1,
    });
    expect(result.ok).toBe(true);
    expect(result.validCount).toBe(1);
    expect(result.vehicles[0]?.vin).toBe('1C4RJFBG0JC123456');
  });

  it('rejects non-array JSON', async () => {
    const snapshot = {
      provider: 'normalized_inventory_http',
      transport: 'HTTPS' as const,
      format: 'JSON' as const,
      sourceIdentifier: 'https://feeds.example.com/x.json',
      checksum: 'abc',
      fetchedAt: new Date().toISOString(),
      raw: JSON.stringify({ vehicles: [] }),
    };
    const result = await provider.validateAndNormalize(snapshot, {
      minRecords: 1,
    });
    expect(result.ok).toBe(false);
    expect(result.anomalies.some((a) => a.includes('invalid_json'))).toBe(true);
  });

  it('rejects records missing required fields', async () => {
    const snapshot = {
      provider: 'normalized_inventory_http',
      transport: 'HTTPS' as const,
      format: 'JSON' as const,
      sourceIdentifier: 'https://feeds.example.com/x.json',
      checksum: 'abc',
      fetchedAt: new Date().toISOString(),
      raw: JSON.stringify([{ make: 'Jeep' }]),
    };
    const result = await provider.validateAndNormalize(snapshot, {
      minRecords: 1,
    });
    expect(result.ok).toBe(false);
    expect(result.validCount).toBe(0);
  });
});
