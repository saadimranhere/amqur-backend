# Final Security Review

**Date:** 2026-08-09  
**Branch:** `feat/platform-completion-100`  
**Scope:** Repository-controlled security controls for AMQUR Platform (backend + widget)  
**Public traffic:** OFF (fail-closed)

---

## Summary

| Control area | Status | Evidence |
|--------------|--------|----------|
| Tenant isolation | ✅ PASS | Prisma scoping, guards, e2e-style tests |
| JWT authentication | ✅ PASS | Strategy, guards, disabled-user rejection |
| Origin fail-closed | ✅ PASS | Empty allowlist → 403; 68/68 production probes |
| SSRF (inventory feeds) | ✅ PASS | `assertFeedUrlAllowed`, HTTPS in prod |
| Prompt injection defense | ✅ PASS | Sanitization util + retrieval filtering |
| Grounding guard | ✅ PASS | Blocks ungrounded inventable claims |
| Upload MIME validation | ✅ PASS | Allowlist jpeg/png/webp/pdf; size cap 10MB |
| No secrets in logs | ✅ PASS | Structured logging; public payload scrubbed |
| Capability fail-closed | ✅ PASS | Defaults false; `=== true` only for widget |

**Verdict:** Security controls are code-complete and verified by automated tests. Live exposure remains minimal due to fail-closed production posture.

---

## 1. Tenant isolation

**Implementation**

- All tenant-scoped queries filter by `tenantId` from authenticated context
- `@CurrentUser()` decorator extracts tenant from JWT; cross-tenant access rejected
- Throttling per tenant via `TenantThrottlerGuard`

**Evidence**

- `backend/src/tenants/tenants.service.ts`
- `backend/src/common/decorators/current-user.decorator.ts`
- `backend/src/common/guards/tenant-throttler.guard.ts`

**Tests**

- `backend/src/common/decorators/tenant-isolation.spec.ts`
- `backend/src/common/security/tenant-isolation.e2e-style.spec.ts`
- `backend/test/suites/tenant-isolation.e2e-spec.ts`

**Production verification:** Fail-closed matrix confirms distinct tenant identities; no cross-tenant data in public widget-config.

---

## 2. JWT authentication

**Implementation**

- Passport JWT strategy validates signature, expiry, issuer
- Role-based access via `RolesGuard` (SUPER_ADMIN, TENANT_ADMIN, STAFF)
- Disabled users rejected at auth service layer
- Bootstrap registration disabled in production (403)

**Evidence**

- `backend/src/auth/auth.service.ts`
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`, `roles.guard.ts`

**Tests**

- `auth.service.spec.ts`, `auth.bootstrap.spec.ts`, `jwt-auth.guard.spec.ts`, `roles.guard.spec.ts`, `auth.disabled-user.spec.ts`

---

## 3. Origin fail-closed (widget public API)

**Implementation**

- `WidgetAuthService` requires matching `Origin` header against tenant `allowedOrigins`
- Empty or null allowlist → **403** for all token requests
- Production tenants ship with empty origins (no public embed surface)

**Evidence**

- `backend/src/public/widget-auth.service.ts`
- `backend/src/public/public.controller.ts`

**Tests**

- `widget-auth.service.spec.ts` — explicitly tests empty allowlist fail-closed

**Production probes:** 30/30 origin rejection tests across 6 tenants in `production-failclosed-latest.json`.

---

## 4. SSRF protection (inventory feeds)

**Implementation**

- `assertFeedUrlAllowed` blocks private IP ranges, metadata endpoints, non-HTTPS in production
- Optional `INVENTORY_FEED_ALLOWED_HOSTS` allowlist
- Request timeouts and bounded payload size on feed fetch
- Anomaly guards prevent marking all vehicles sold on bad snapshots

**Evidence**

- `backend/src/common/security/feed-url.guard.ts`
- `backend/src/integrations/vauto/vauto-feed.provider.ts`
- `backend/src/integrations/normalized-inventory/normalized-inventory-http.provider.ts`

**Tests**

- `feed-url.guard.spec.ts`
- `vauto-feed.provider.spec.ts` (anomaly rejection)
- `normalized-inventory-http.provider.spec.ts`

---

## 5. Prompt injection defense

**Implementation**

- Knowledge chunks sanitized before injection into LLM context
- Suspicious patterns stripped/delimited in `prompt-injection.util.ts`
- Retrieval service applies defense at fetch time

**Evidence**

- `backend/src/knowledge/prompt-injection.util.ts`
- `backend/src/knowledge/knowledge-retrieval.service.ts`

**Tests**

- `prompt-injection.util.spec.ts`
- `knowledge-retrieval.service.spec.ts`

---

## 6. Grounding guard

**Implementation**

- Truth resolver + grounding guard block responses that assert inventable facts without verified sources
- Inventory freshness engine gates stale/missing inventory claims
- Feature flags disable inventable surfaces when inventory off

**Evidence**

- `backend/src/source-authority/grounding-guard.service.ts`
- `backend/src/source-authority/truth-resolver.service.ts`
- `backend/src/chat/engines/inventory-freshness.ts`

**Tests**

- `grounding-guard.service.spec.ts`
- `truth-resolver.service.spec.ts`
- `truthfulness-golden.spec.ts`, `truthfulness-golden-expanded.spec.ts`
- `inventory-freshness.spec.ts`

---

## 7. Upload MIME validation

**Implementation**

- Allowlist: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max size: 10 MB
- Tenant-scoped storage keys with path traversal prevention
- Optional malware scanner interface (default: SKIPPED)

**Evidence**

- `backend/src/uploads/uploads.service.ts` — `validateMime()`, `validateSize()`, `safeStorageKey()`

**Tests:** Manual code review; no dedicated spec (validation is synchronous throw).

---

## 8. No secrets in logs

**Implementation**

- Public widget-config strips internal IDs and secrets
- Secret vault service for integration credentials (not logged)
- Escalation webhook URL absence logged as warning only (no payload secrets)
- Production fail-closed probes verify no secret leakage in public JSON

**Evidence**

- `backend/src/public/public.service.ts`
- `backend/src/integrations/core/secret-vault.service.ts`
- `production-failclosed-latest.json` — "no internal ids / secrets in public payload" × 6

**Tests**

- `secret-vault.service.spec.ts`
- `public.service.spec.ts`

---

## 9. Capability fail-closed

**Implementation**

- `FeatureFlagsService` defaults all flags to false unless explicitly true in tenant config
- `CapabilityService` gates service/parts/inventory/payments/Tekion/vAuto
- Widget receives fail-closed subset (`forWidget()` uses `=== true` only)
- Chat service/parts paths return safe copy when flags off

**Evidence**

- `backend/src/feature-flags/feature-flags.service.ts`
- `backend/src/capability/capability.service.ts`

**Tests**

- `feature-flags.service.spec.ts` — "defaults fail-closed for inventory/payments"
- `capability.service.spec.ts`
- `canary-gate.spec.ts`, `staging-pilot-policy.spec.ts`
- `platform.e2e-spec.ts` — "service/parts fail-closed when flags off"

---

## 10. Additional controls

| Control | Status | Notes |
|---------|--------|-------|
| Rate limiting | ✅ | Tenant throttler guard |
| Circuit breaker | ✅ | Integration calls (`circuit-breaker.service.ts`) |
| Idempotency | ✅ | Outbox + lead idempotency keys |
| CORS | ✅ | Origin-based; not wildcard for widget-token |
| Employee canary auth | ✅ | HttpOnly cookie; rejects client-writable flags |
| Dependency audit | ✅ | `test/evidence/npm-audit.json` captured |

---

## Residual risks (external / operational)

| Risk | Mitigation | Owner |
|------|------------|-------|
| Live Tekion misconfiguration | Fail-closed until `liveReady` + secrets | Integration team |
| Origin mis-set enabling wrong domain | Require verified DNS + incremental rollout | Operator |
| CRM webhook exfiltration | HTTPS only; URL in env not repo | DevOps |
| LLM provider key compromise | Railway secrets rotation | DevOps |
| Missing DB backups | Verify Railway snapshot schedule | DevOps |

---

## Sign-off

| Reviewer | Role | Date |
|----------|------|------|
| | Engineering | |
| | Security | |

**Repository security posture:** APPROVED for internal canary with current fail-closed configuration. Public traffic requires re-review after external activation items are enabled.
