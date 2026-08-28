# AMQUR Platform — Project Status

**As of:** 2026-08-10  
**Canonical state:** Repository-controlled platform completion at **100%**; production code **DEPLOYED FAIL-CLOSED**

---

## Executive summary

The AMQUR Platform (backend + widget) completed all in-repository workstreams and has been deployed to Dial Us Now **staging and production** on main SHAs below. Production remains **fail-closed**: empty `allowedOrigins`, inventory/service/parts/voice/payments off, `INVENTORY_SYNC_ENABLED=false`. **Public customer traffic is OFF.**

| Metric | Value |
|--------|-------|
| Repository completion | 100% |
| Backend unit tests | 263 passed (56 suites) |
| Widget tests | 35 passed; build OK |
| Backend main SHA | `411fd0adb1584dc84cbc94bac16a0c8291a2f606` |
| Widget main SHA | `f97408a319aea872f68d2e5319ce0eb4c612a476` |
| Production tenants (fail-closed) | 6 rooftops |
| Public traffic | **OFF** |
| Merchant Center / VLA | **Not in AMQUR scope** |

---

## Deployment (2026-08-10 activation)

| Surface | SHA | Evidence |
|---------|-----|----------|
| Staging API | `411fd0a…` | `/api/version`, health DB+Redis up |
| Staging worker | `411fd0a…` | Railway deploy success |
| Staging widget | `f97408a…` | `version.json` |
| Production API | `411fd0a…` | `/api/version`, health ready |
| Production worker | `411fd0a…` | Railway deploy `db4361f1-…` |
| Production widget | `f97408a…` | `version.json`; no staging banner |

**Staging automated canary:** 65/65 (`canary-matrix-latest.json`)  
**Staging chat truth canary (automated technical):** 8/8 (`staging-chat-truth-canary-latest.json`) — **not** a human employee canary  
**Production fail-closed matrix:** 68/68 (`production-failclosed-latest.json`)

**Deploy path:** Local Railway CLI OAuth (authenticated as project owner). GitHub Actions `RAILWAY_TOKEN` secret **name** is present but the stored value is **invalid** for Railway API/CLI — CI Deploy remains blocked until a working token is created (USER PRESENCE / dashboard).

---

## Production infrastructure (Dial Us Now)

| Component | Status |
|-----------|--------|
| `api.dialusnow.com` | Deployed completion SHA; health OK; fail-closed |
| `widget.dialusnow.com` | Deployed completion SHA; CDN IIFE |
| Postgres + Redis + worker | Online |
| DNS/TLS | CNAME→Railway; Let's Encrypt certs valid (verified 2026-08-10) |
| Origin allowlist | **Empty** on all tenants → widget-token **403** |
| Bootstrap registration | Disabled in production (403) |
| Volume backups | **Not available on Hobby** (`maxBackupsCount: 0`) — see `docs/operations/PRODUCTION_BACKUP_EVIDENCE.md` |
| `ERROR_MONITORING_DSN` | **UNSET** |

**Verdict:** **DEPLOYED FAIL-CLOSED — EXTERNAL ACTIVATION IN PROGRESS.** Ready for internal human canary after owner invite + monitoring/backup plan decisions. Not ready for public dealership website install.

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
| Omnichannel / voice | ✅ stubs | ⏸ provider credentials |

---

## Notes

- Staging slug for group pilot seed is `dial-auto-group-staging` (not `dial-auto-group`). Production group tenant `dial-auto-group` exists and is fail-closed.
- Sibling `vauto-gmc-automation` is Merchant Center feed automation only — **not** an AMQUR normalized inventory source.

---

## Independent re-verification (2026-08-27)

Fresh from-zero audit of the completion claim, run on backend `c403ad9` / widget `f246c91` (main):

| Gate | Result |
|------|--------|
| Backend typecheck + lint | PASS (0 errors) |
| Backend unit tests | 263/263 (56 suites) |
| Backend e2e (fresh DB via test-infra, `prisma migrate deploy`) | 33/33 platform + 8/8 migration |
| Backend production build | PASS |
| Widget lint + tsc + Vitest | 35/35; IIFE build 624.58 kB (byte-matches deployed asset) |
| Widget Playwright local (5 browser projects, a11y + widget matrix) | 35/35 |
| Widget Playwright staging (5 browser projects) | 65/65 |
| Staging automated canary matrix | 65/65 |
| Production fail-closed matrix | 68/68 |
| Prod bundle contamination scan (staging URLs/localhost/secrets) | Clean |
| Prod/staging deployed SHAs vs main | Match (`/api/version`, `version.json`) |
| Prod health | DB up, Redis up, ready |
| TODO/FIXME/`.only`/`.skip` sweep (prod paths) | Clean (only env-gated staging skips) |

No repository-controlled defects found. Outstanding items remain the owner/external activation gates listed in `docs/EXTERNAL_ACTIVATION_HANDOFF.md` (origins + GTM install, Tekion/feed/Twilio/voice credentials, `ERROR_MONITORING_DSN`, Railway backup plan upgrade, human employee canary, production activation approval).
