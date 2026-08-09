# Rollback and Kill-Switch Procedures

**Date:** 2026-08-09  
**Environment:** Dial Us Now production (`dial-us-now-platform`)  
**Status:** Procedures verified 2026-07-20; controls remain active

This document consolidates rollback paths for AMQUR production. **Preferred order: kill switch first, redeploy second.**

---

## 1. Immediate kill switches (no redeploy)

### 1a. Disable chat for a tenant

Updates tenant `featureFlags.chat=false` and increments `configVersion`. Effect is immediate on `GET /api/public/widget-config`.

```bash
# Via Railway SSH on prod-api (see live-rollback-plan.md for full context)
# Prisma update: featureFlags.chat = false, configVersion += 1
```

**Verify:** widget-config shows `"chat": false`.

**Restore:** Set `chat=true`, increment `configVersion`.

**Proven:** 2026-07-20 on `dial-auto-group` tenant (configVersion 2→3→4).

### 1b. Fail-closed origin control

Empty `allowedOrigins` → all widget-token requests return **403**.

| State | Widget-token result |
|-------|---------------------|
| `allowedOrigins: null` | 403 — "Widget origins not configured" |
| Single verified origin set | 201 only with matching Origin header |
| Evil / missing Origin | 403 |

**Fastest public traffic stop:** Clear all origins (null) on affected tenant(s).

**Proven:** 2026-07-20 origin add/remove cycle (configVersion 5→6).

### 1c. Feature flag rollback (capability service)

Disable specific capabilities without code deploy:

| Flag area | Effect when false |
|-----------|-------------------|
| `inventory` | No inventable vehicle claims |
| `payments` | Payment flows fail-closed |
| `service` / `parts` | Service/parts assistants disabled |
| `vAutoFeed` | Inventory sync skipped |

Paths: tenant JSON / DB `featureFlags`, `backend/src/capability/capability.service.ts`.

### 1d. Bootstrap lock

Production bootstrap returns **403** by design. Do not re-enable without explicit approval.

---

## 2. Service rollback (Railway)

### CLI limitation

`railway deployment redeploy` redeploys **latest** deployment only. Historical deployment targeting requires GraphQL.

### GraphQL redeploy (proven on prod-widget)

```graphql
mutation {
  deploymentRedeploy(id: "<historical-deployment-uuid>", usePreviousImageTag: true) {
    id
    status
  }
}
```

Endpoint: `https://backboard.railway.com/graphql/v2`

### Observed deployment IDs (2026-07-20)

| Service | Current (at proof) | Notes |
|---------|-------------------|-------|
| prod-api | `82d64a7e-f865-4129-b3b3-a0e7b76507e9` | SHA `f9eea30` |
| prod-worker | `77c85a1b-2aca-4dd7-bc42-56bdfe96ab8a` | SHA `f9eea30` |
| prod-widget | `9848d1bf-3aec-419c-9024-5f21bb3d8b09` | SHA `b9e7b4b` |

Full evidence: `docs/deployment/live-rollback-plan.md`

### Rollback order

1. **Widget first** — removes client-side embed surface
2. **API second** — if API regression
3. **Worker last** — outbox will backlog safely; no data loss for accepted handoffs

---

## 3. Database rollback

**Never restore over active production DB.**

1. Create fresh Postgres service or database
2. Restore from latest Railway volume snapshot or logical dump
3. Verify table counts + `_prisma_migrations`
4. Repoint `DATABASE_URL` only after verification

Procedure: `backend/docs/operations/disaster-recovery.md`

---

## 4. Outbox / handoff safety during rollback

- Accepted escalations persist in DB + `OutboxEvent` (same transaction)
- Worker crash does not lose handoffs
- During API rollback, outbox rows remain PENDING and retry
- Monitor `DEAD` status rows after rollback

---

## 5. Widget CDN rollback

1. Identify previous good deployment UUID (Railway widget service)
2. GraphQL redeploy with `usePreviousImageTag: true`
3. Verify `version.json` SHA and IIFE hash
4. Clear browser/CDN cache if needed (Cache-Control on widget assets)

---

## 6. External install rollback (GTM / Apollo)

| Path | Rollback action |
|------|-----------------|
| Apollo pixel | Set **Is Enabled = False** in Team Velocity |
| GTM | Unpublish workspace version / remove tag |
| Dual install | **Forbidden** — never run GTM + Apollo simultaneously |

---

## 7. Decision matrix

| Symptom | First action | Second action |
|---------|--------------|---------------|
| Bad AI responses | Disable chat flag | Redeploy previous API SHA |
| Origin abuse / token leak | Clear `allowedOrigins` | Rotate JWT signing secret |
| Inventory hallucination | Disable inventory flag | Confirm feed sync off |
| Handoff spam | Disable handoff flag | Clear CRM webhook URL |
| Full platform stop | Clear all origins + disable chat | Widget redeploy + Apollo disable |

---

## 8. Post-rollback verification

- [ ] widget-config reflects disabled features
- [ ] widget-token returns 403 (origins cleared)
- [ ] Health endpoints 200
- [ ] No new leads with unexpected source
- [ ] Outbox queue draining or intentionally paused
- [ ] Incident documented per `backend/docs/operations/incident-response.md`

---

## References

- `docs/deployment/live-rollback-plan.md` — detailed 2026-07-20 proof
- `backend/docs/operations/disaster-recovery.md` — backup/restore
- `backend/test/evidence/production-failclosed-latest.json` — baseline probes
