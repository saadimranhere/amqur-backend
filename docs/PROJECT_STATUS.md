# AMQUR Platform — Project Status

**As of:** 2026-08-09  
**Completion branch:** `feat/platform-completion-100` (backend + widget)  
**Canonical state:** Repository-controlled platform completion at **100%**

---

## Executive summary

The AMQUR Platform (backend + widget) has completed all in-repository workstreams for the Dial Auto Group operating system. Production Dial Us Now infrastructure is **READY FOR INTERNAL CANARY** with **fail-closed** defaults. **Public customer traffic is OFF.** Inventory, service, parts, Tekion, voice, and omnichannel live send remain fail-closed until external activation.

| Metric | Value |
|--------|-------|
| Repository completion | 100% |
| Backend unit tests | 224 passed (54 suites) |
| Widget tests | 35 passed; build OK |
| Production tenants (fail-closed) | 6 rooftops |
| Public traffic | **OFF** (empty `allowedOrigins`, feature gates conservative) |
| Merchant Center / VLA | **Not in AMQUR scope** |

---

## Repository state

| Repo | Branch | Role |
|------|--------|------|
| `backend` | `feat/platform-completion-100` | NestJS API, worker, Prisma, integrations |
| `amqur-widget` | `feat/platform-completion-100` | Embeddable IIFE widget, canary loader |

Evidence artifact: `backend/test/evidence/final-completion-report.json`

---

## Production infrastructure (Dial Us Now)

| Component | Status |
|-----------|--------|
| `api.dialusnow.com` | Deployed; health OK; fail-closed |
| `widget.dialusnow.com` | Deployed; CDN serves IIFE |
| Postgres + worker | Online |
| 6 production tenants | Onboarded; chat/lead/handoff enabled; inventory/payments/service **disabled** |
| Origin allowlist | **Empty** on all tenants → widget-token returns 403 |
| Bootstrap registration | Disabled in production (403) |
| Fail-closed probe matrix | 68/68 passed (`production-failclosed-latest.json`) |

**Verdict:** Infrastructure ready for internal canary. Not authorized for public dealership website install or customer-facing traffic.

---

## Domain readiness (high level)

| Domain | Code | Live |
|--------|------|------|
| Multi-tenancy, auth, truth engine | ✅ | ✅ (fail-closed defaults) |
| Knowledge / RAG (keyword hybrid) | ✅ | ✅ |
| Widget UI + public API | ✅ | ⏸ origins unset |
| Inventory consumer + normalized HTTP | ✅ | ⏸ feed credentials |
| Tekion adapter (mock) | ✅ | ⏸ partner credentials |
| Handoff / escalations | ✅ | ⏸ CRM webhook |
| Omnichannel (mock) | ✅ | ⏸ Twilio/Meta |
| Voice (`DisabledVoiceProvider`) | ✅ | ⏸ telephony vendor |
| CI, tests, docs, security | ✅ | ✅ |

⏸ = fail-closed until external activation (see `EXTERNAL_ACTIVATION_HANDOFF.md`)

---

## What is NOT part of this platform

- Google Merchant Center publishing
- SFTPGo / Vehicle Ads feed hosting
- vAuto → Merchant Center automation (`vauto-gmc-automation` is a separate project)

Boundary: `docs/architecture/INVENTORY_INTEGRATION_BOUNDARY.md`

---

## Next steps (external only)

1. Complete items in `docs/EXTERNAL_ACTIVATION_HANDOFF.md`
2. Run human employee canary per `backend/docs/CANARY_EMPLOYEE_AUTH.md`
3. Obtain business approval signatures
4. Enable origins + feature flags incrementally per tenant
5. Never enable public traffic without signed go/no-go

---

## Key documents

| Document | Purpose |
|----------|---------|
| `docs/engineering/FINAL_COMPLETION_LEDGER.md` | Per-workstream evidence (1–50) |
| `docs/EXTERNAL_ACTIVATION_HANDOFF.md` | External-only activation checklist |
| `docs/operations/FINAL_RELEASE_CHECKLIST.md` | Pre-release verification |
| `docs/operations/ROLLBACK.md` | Kill switches and rollback |
| `docs/security/FINAL_SECURITY_REVIEW.md` | Security posture summary |
