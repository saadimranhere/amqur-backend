# External Activation Handoff

**Date:** 2026-08-10 (activation pass — GitHub Actions CI/CD verified)  
**Code:** Backend main `c403ad9…` (completion `411fd0a…` + Deploy workflow fix) / Widget main `f246c91…` (completion `f97408a…` + Deploy workflow fixes).  
**Deploy path:** GitHub Actions Deploy → Railway (**staging PASS** → production gate approval → **production PASS**) on both repos. Runtime SHAs match main. Fail-closed preserved.  
**Scope:** Items that **cannot** be completed inside the AMQUR repositories. All code paths referenced below already exist and are fail-closed until these externals are satisfied.

**Do not treat this list as incomplete code.** Repository-controlled completion is 100%. GitHub→Railway deployment is verified; public traffic remains OFF.

---

## Activation items (external only)

### 1. Tekion DMS / CRM live integration

| Field | Detail |
|-------|--------|
| **Required** | Tekion partner credentials, official API documentation, sandbox/production base URLs |
| **Code ready** | `backend/src/integrations/tekion/tekion.provider.ts` (mock today) |
| **Gate** | Set `liveReady` + secrets in Railway; enable Tekion capability per tenant |
| **Docs** | `backend/docs/integrations/TEKION_VENDOR_ONBOARDING.md` |

**Status:** CODE COMPLETE — EXTERNAL ACTIVATION BLOCKED (Tekion partner access / official docs + credentials).

---

### 2. Per-rooftop inventory feed credentials

| Field | Detail |
|-------|--------|
| **Required** | Verified HTTPS feed URL per location (vAuto export or normalized JSON contract) |
| **Code ready** | `VAutoFeedProvider`, `NormalizedInventoryHttpProvider` |
| **Gate** | `INVENTORY_SYNC_ENABLED`, per-location `IntegrationConnection`, `INVENTORY_FEED_ALLOWED_HOSTS` |
| **Docs** | `backend/docs/integrations/VAUTO_FEED_ONBOARDING.md`, `docs/architecture/INVENTORY_INTEGRATION_BOUNDARY.md` |

**Note:** Merchant Center / SFTP publishing is **not** AMQUR — separate VLA project. Sibling `vauto-gmc-automation` exposes MC CSV hosts only — **no** verified AMQUR normalized inventory HTTPS contract found.

**Status:** CODE COMPLETE — EXTERNAL ACTIVATION BLOCKED (per-rooftop verified feed URLs + auth). `INVENTORY_SYNC_ENABLED=false` in staging and production.

---

### 3. CRM webhook and escalation recipients

| Field | Detail |
|-------|--------|
| **Required** | `CRM_WEBHOOK_URL` (HTTPS), escalation email/SMS recipient list |
| **Code ready** | `backend/src/escalations/escalations.service.ts` persists + outbox notify |
| **Current** | Webhook unset — escalations stored, outbound notify skipped (logged) |

**Status:** CODE COMPLETE — EXTERNAL ACTIVATION BLOCKED (`CRM_WEBHOOK_URL` + verified recipients).

---

### 4. Twilio / WhatsApp / Meta omnichannel

| Field | Detail |
|-------|--------|
| **Required** | Twilio account SID/auth, WhatsApp Business approval, Meta app review if applicable |
| **Code ready** | `MockMessagingProvider` in `channel-adapter.service.ts`; Twilio port interface |
| **Gate** | Replace mock with live provider; enable channel flags per tenant |

**Status:** CODE COMPLETE — EXTERNAL ACTIVATION BLOCKED (provider credentials / approvals).

---

### 5. Voice telephony vendor

| Field | Detail |
|-------|--------|
| **Required** | SIP trunk or CPaaS vendor (Twilio Voice, Telnyx, etc.), phone numbers, compliance |
| **Code ready** | `DisabledVoiceProvider` — sessions rejected until provider configured |
| **Paths** | `backend/src/voice/voice-session.service.ts`, `integrations/voice/voice.provider.ts` |

**Status:** CODE COMPLETE — EXTERNAL ACTIVATION BLOCKED (CPaaS account + numbers).

---

### 6. Team Velocity / GTM website widget install

| Field | Detail |
|-------|--------|
| **Required** | GTM container edit access **or** Team Velocity / Apollo pixel deployment permission |
| **Code ready** | Widget IIFE + canary loader on CDN; install scripts in `backend/docs/vendor-handoff/team-velocity/` |
| **Current** | Apollo pixel saved with **Is Enabled = False**; no GTM publish |
| **Docs** | `backend/docs/EXTERNAL_AUTHORIZATION_REQUIRED.md` |

**Status:** CODE COMPLETE — EXTERNAL ACTIVATION BLOCKED (GTM/Team Velocity access; USER PRESENCE likely). Do not enable origins until install verified.

---

### 7. Railway backup schedule and error monitoring proof

| Field | Detail |
|-------|--------|
| **Required** | Confirm Postgres volume backup schedule in Railway dashboard; configure `ERROR_MONITORING_DSN` and verify alert delivery |
| **Code ready** | Observability instrumentation, metrics endpoint |
| **Docs** | `docs/operations/PRODUCTION_BACKUP_EVIDENCE.md`, `backend/docs/operations/disaster-recovery.md`, `backend/docs/OBSERVABILITY_CANARY.md` |

**Status (2026-08-10 evidence):** PARTIAL — EXTERNAL DEPENDENCY. Hobby plan `maxBackupsCount: 0` — schedule/create **Not Authorized**; backup lists empty. `ERROR_MONITORING_DSN` **absent** on prod-api. Railway service health/logs available (7-day Hobby retention).

---

### 8. GitHub production environment and Railway token

| Field | Detail |
|-------|--------|
| **Required** | Production environment reviewers on GitHub; working Railway CI credential |
| **Code ready** | `backend/.github/workflows/deploy.yml`, widget `deploy.yml` |

**Status (2026-08-10):** **VERIFIED.** Exact GitHub environments `staging` + `production` exist on both repos; production has required-reviewer protection. Deploy workflows use `RAILWAY_API_TOKEN` (account/workspace token — required for multi-env) with pinned project id `dial-us-now-platform`. Compromised/invalid `RAILWAY_TOKEN` secrets removed. Successful GHA Deploy runs: backend [31357625970](https://github.com/AMQUR/amqur-backend/actions/runs/31357625970), widget [31357753944](https://github.com/AMQUR/amqur-widget/actions/runs/31357753944).

Legacy unrelated environments left in place: `divine-integrity / production`, `reasonable-expression / production`, `zesty-harmony / production` (backend); `github-pages` (widget).

---

### 9. Verified dealership hours, phones, addresses, and origins

| Field | Detail |
|-------|--------|
| **Required** | Human-verified store hours, main phone, address, and **HTTPS website origins** per rooftop |
| **Code ready** | Onboarding JSON templates in `backend/config/production-onboarding/` |
| **Gate** | Populate `allowedOrigins` only after DNS/HTTPS verification |

**Status:** BLOCKED_EXTERNAL / owner verification — `docs/canary/owner-website-origins.md` still PENDING; all production onboarding `allowedOrigins: []`.

---

### 10. Human employee canary execution

| Field | Detail |
|-------|--------|
| **Required** | Staff run employee test script on staging/production with backend-issued invite cookie |
| **Code ready** | `backend/docs/CANARY_EMPLOYEE_AUTH.md`, `docs/canary/employee-test-script.md` |
| **Not automated** | Requires human browser session on dealership network |

**Status:** Automated **technical** canaries passed (staging matrix 65/65; chat truth 8/8; prod fail-closed 68/68). **Human employee canary:** not run — do not equate automation with human signoff.

---

### 11. Business approval signatures

| Field | Detail |
|-------|--------|
| **Required** | Signed go/no-go from dealership leadership and AMQUR operator |
| **Templates** | `backend/docs/JEEP_OF_CHICAGO_INTERNAL_CANARY_APPROVAL.md`, `JEEP_OF_CHICAGO_PRODUCTION_RELEASE_APPROVAL.md` |

**Status:** OWNER TECHNICAL AUTHORIZATION: GRANTED (Saad — production activation mission). Formal dealership leadership signatures: still required for customer-visible pilot — do not forge.

---

### 12. DNS ownership confirmation (if needed)

| Field | Detail |
|-------|--------|
| **Required** | Confirm `dialusnow.com` / widget CDN DNS remains under operator control; dealership origin DNS for CORS |
| **Docs** | `docs/deployment/dialusnow-dns-records.md` |

**Status:** VERIFIED for Dial Us Now hosts (2026-08-10): `api`, `widget`, `staging-api`, `staging-widget` — CNAME to Railway `*.up.railway.app`, TLS Let's Encrypt, HTTPS responding. Dealership website origin DNS: still pending per-rooftop verification (item 9).

---

## Explicitly NOT listed here (already complete in repo)

- Truth engine, grounding guard, prompt injection defense
- Knowledge/RAG keyword hybrid + ingestion
- Widget UI (lead, handoff, branding, compare, saved, consent)
- Feature gates, capability fail-closed, tenant isolation
- Unit/integration test suites (263 backend / 56 suites + 35 widget)
- CI/CD pipelines, deployment scripts, rollback/kill-switch code
- Normalized inventory HTTP adapter (SSRF guard, schema validation)
- Outbox, cache, observability instrumentation

---

## Activation sequence (recommended)

1. Verify tenant data (hours, phones, addresses) — item 9
2. Configure monitoring + backups — item 7
3. Run employee canary on staging — item 10
4. Obtain business signatures — item 11
5. Install widget (disabled/preview) — item 6
6. Set single verified origin; test widget-token — item 9
7. Enable inventory feed for one pilot rooftop — item 2
8. Configure CRM webhook — item 3
9. Tekion sandbox → live — item 1
10. Twilio/voice if needed — items 4, 5
11. Incremental feature flag rollout with rollback plan ready

**Public traffic remains OFF until steps 10–11 and signed approval.**

---

## Per-item activation template (applies to every item above)

For each external item, activation must record:

| Field | Requirement |
|-------|-------------|
| system/provider | Named vendor or dashboard |
| capability unlocked | Exact feature flag / IntegrationConnection field |
| why code cannot complete it | Credential, browser UI, legal approval, or vendor docs |
| credential/permission required | Secret name or access role (never paste values into git) |
| browser/provider action | Exact click-path or ticket |
| environment | staging first, then production |
| safe verification procedure | Health endpoint, dry-run, or canary matrix step |
| expected success evidence | Log line, HTTP 200, `liveReady=true`, screenshot path |
| rollback/disable method | Set flag false / disable connection / unset env |
| feature flag that stays off | Until verification evidence exists |
| dependencies/prerequisites | Prior items that must be green |
| synthetic testing permitted? | Yes in staging mocks only; never invent production facts |

Synthetic testing is permitted only against mocks/fixtures and fail-closed production probes.

