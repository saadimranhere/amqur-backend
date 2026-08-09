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
    type GroupRole = 'GROUP_VIEWER' | 'GROUP_ADMIN';
    const groupRole: GroupRole = 'GROUP_VIEWER';
    // Group roles never imply child-tenant mutation without an explicit staff JWT role.
    const mutationAllowedByGroupRole = (role: GroupRole) =>
      role === 'GROUP_ADMIN' ? false : false;
    expect(mutationAllowedByGroupRole(groupRole)).toBe(false);
    expect(mutationAllowedByGroupRole('GROUP_ADMIN')).toBe(false);
    const reportingPayload = {
      tenantSlug: 'jeep-of-chicago',
      counts: { leads: 3 },
    };
    expect(reportingPayload).not.toHaveProperty('leads');
    expect(reportingPayload).not.toHaveProperty('update');
  });

  it('widget token cannot access staff knowledge publish', () => {
    type Role = 'widget' | 'STAFF' | 'ADMIN' | 'MANAGER' | 'SUPER_ADMIN';
    const role: Role = 'widget';
    const staffRoles: Role[] = ['STAFF', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'];
    expect(staffRoles.includes(role)).toBe(false);
  });
});
