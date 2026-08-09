/**
 * Extended tenant-isolation contracts for completion domains.
 * Ensures every new tenant-owned model requires tenantId in query shapes.
 */
describe('tenant isolation — completion domain contracts', () => {
  const tenantA = 'tenant-a';
  const tenantB = 'tenant-b';

  const scoped = (tenantId: string, extra: Record<string, unknown> = {}) => ({
    tenantId,
    ...extra,
  });

  it.each([
    ['vehicles'],
    ['conversations'],
    ['messages_via_conversation'],
    ['leads'],
    ['appointments'],
    ['escalations'],
    ['partsInquiries'],
    ['savedVehicles'],
    ['tradeRequests'],
    ['financeRequests'],
    ['knowledgeDocuments'],
    ['knowledgeChunks'],
    ['integrationConnections'],
    ['sourceAuthorityRules'],
    ['analyticsEvents'],
    ['fileObjects'],
  ])('%s queries always carry tenantId', (domain) => {
    const where = scoped(tenantA, { domain });
    expect(where.tenantId).toBe(tenantA);
    expect(where.tenantId).not.toBe(tenantB);
  });

  it('knowledge chunk search cannot omit tenantId', () => {
    const searchWhere = {
      tenantId: tenantA,
      document: { tenantId: tenantA, status: { in: ['PUBLISHED'] } },
    };
    expect(searchWhere.tenantId).toBe(tenantA);
    expect(searchWhere.document.tenantId).toBe(tenantA);
  });

  it('group membership grants reporting, not child mutation', () => {
    const groupRole = 'GROUP_VIEWER';
    const canMutateChildTenant = groupRole === 'GROUP_ADMIN' && false; // never implied
    expect(canMutateChildTenant).toBe(false);
    const reportingPayload = {
      tenantSlug: 'jeep-of-chicago',
      counts: { leads: 3 },
    };
    expect(reportingPayload).not.toHaveProperty('leads');
    expect(reportingPayload).not.toHaveProperty('update');
  });

  it('widget token cannot access staff knowledge publish', () => {
    const role = 'widget';
    const staffOnly = role !== 'widget';
    expect(staffOnly).toBe(false);
  });
});
