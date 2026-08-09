import { TruthResolverService } from './truth-resolver.service';
import { SourceAuthorityService } from './source-authority.service';
import { FreshnessService } from './freshness.service';

describe('TruthResolverService', () => {
  const authority = {
    resolve: jest.fn(),
    recordConflict: jest.fn(),
  } as unknown as SourceAuthorityService;
  const freshness = new FreshnessService();
  const svc = new TruthResolverService(authority, freshness);

  const now = new Date();
  const stale = new Date(Date.now() - 48 * 60 * 60 * 1000);

  beforeEach(() => {
    jest.resetAllMocks();
    (authority.resolve as jest.Mock).mockResolvedValue({
      field: 'advertised_price',
      primarySource: 'vauto',
      fallbackSource: 'tekion',
      freshnessSlaHours: 24,
    });
    (authority.recordConflict as jest.Mock).mockResolvedValue({ id: 'conf-1' });
  });

  it('returns unverified when no fresh authoritative source (missing inventory)', async () => {
    const result = await svc.resolveField({
      tenantId: 't1',
      field: 'inventory_availability',
      entityType: 'vehicle',
      entityId: 'v1',
      candidates: [],
    });
    expect(result.verified).toBe(false);
    expect(result.value).toBeNull();
  });

  it('returns unverified when source is stale', async () => {
    const result = await svc.resolveField({
      tenantId: 't1',
      field: 'advertised_price',
      entityType: 'vehicle',
      entityId: 'v1',
      candidates: [{ source: 'vauto', value: '42000', observedAt: stale }],
    });
    expect(result.verified).toBe(false);
    expect(result.value).toBeNull();
  });

  it('returns verified value from primary fresh source', async () => {
    const result = await svc.resolveField({
      tenantId: 't1',
      field: 'advertised_price',
      entityType: 'vehicle',
      entityId: 'v1',
      candidates: [{ source: 'vauto', value: '42000', observedAt: now }],
    });
    expect(result.verified).toBe(true);
    expect(result.value).toBe('42000');
    expect(result.source).toBe('vauto');
  });

  it('records conflict on conflicting fresh prices', async () => {
    const result = await svc.resolveField({
      tenantId: 't1',
      field: 'advertised_price',
      entityType: 'vehicle',
      entityId: 'v1',
      candidates: [
        { source: 'vauto', value: '42000', observedAt: now },
        { source: 'tekion', value: '39999', observedAt: now },
      ],
    });
    expect(result.conflict).toBe(true);
    expect(authority.recordConflict).toHaveBeenCalled();
    expect(result.provenance.conflictId).toBe('conf-1');
  });

  it('uses fallback when primary stale but fallback fresh', async () => {
    const result = await svc.resolveField({
      tenantId: 't1',
      field: 'advertised_price',
      entityType: 'vehicle',
      entityId: 'v1',
      candidates: [
        { source: 'vauto', value: '42000', observedAt: stale },
        { source: 'tekion', value: '41000', observedAt: now },
      ],
    });
    expect(result.verified).toBe(true);
    expect(result.value).toBe('41000');
    expect(result.source).toBe('tekion');
  });
});
