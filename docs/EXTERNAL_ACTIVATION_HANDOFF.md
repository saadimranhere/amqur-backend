# External Activation Handoff

**Date:** 2026-08-09  
**Branch:** `feat/platform-completion-100`  
**Scope:** Items that **cannot** be completed inside the AMQUR repositories. All code paths referenced below already exist and are fail-closed until these externals are satisfied.

**Do not treat this list as incomplete code.** Repository-controlled completion is 100%.

---

## Activation items (external only)

### 1. Tekion DMS / CRM live integration

| Field | Detail |
|-------|--------|
| **Required** | Tekion partner credentials, official API documentation, sandbox/production base URLs |
| **Code ready** | `backend/src/integrations/tekion/tekion.provider.ts` (mock today) |
| **Gate** | Set `liveReady` + secrets in Railway; enable Tekion capability per tenant |
| **Docs** | `backend/docs/integrations/TEKION_VENDOR_ONBOARDING.md` |

**Status:** Adapter complete — **no live Tekion connection**.

---

### 2. Per-rooftop inventory feed credentials

| Field | Detail |
|-------|--------|
| **Required** | Verified HTTPS feed URL per location (vAuto export or normalized JSON contract) |
| **Code ready** | `VAutoFeedProvider`, `NormalizedInventoryHttpProvider` |
| **Gate** | `INVENTORY_SYNC_ENABLED`, per-location `IntegrationConnection`, `INVENTORY_FEED_ALLOWED_HOSTS` |
| **Docs** | `backend/docs/integrations/VAUTO_FEED_ONBOARDING.md`, `docs/architecture/INVENTORY_INTEGRATION_BOUNDARY.md` |

**Note:** Merchant Center / SFTP publishing is **not** AMQUR — separate VLA project.

---

### 3. CRM webhook and escalation recipients

| Field | Detail |
|-------|--------|
| **Required** | `CRM_WEBHOOK_URL` (HTTPS), escalation email/SMS recipient list |
| **Code ready** | `backend/src/escalations/escalations.service.ts` persists + outbox notify |
| **Current** | Webhook unset — escalations stored, outbound notify skipped (logged) |

---

### 4. Twilio / WhatsApp / Meta omnichannel

| Field | Detail |
|-------|--------|
| **Required** | Twilio account SID/auth, WhatsApp Business approval, Meta app review if applicable |
| **Code ready** | `MockMessagingProvider` in `channel-adapter.service.ts`; Twilio port interface |
| **Gate** | Replace mock with live provider; enable channel flags per tenant |

---

### 5. Voice telephony vendor

| Field | Detail |
|-------|--------|
| **Required** | SIP trunk or CPaaS vendor (Twilio Voice, Telnyx, etc.), phone numbers, compliance |
| **Code ready** | `DisabledVoiceProvider` — sessions rejected until provider configured |
| **Paths** | `backend/src/voice/voice-session.service.ts`, `integrations/voice/voice.provider.ts` |

---

### 6. Team Velocity / GTM website widget install

| Field | Detail |
|-------|--------|
| **Required** | GTM container edit access **or** Team Velocity / Apollo pixel deployment permission |
| **Code ready** | Widget IIFE + canary loader on CDN; install scripts in `backend/docs/vendor-handoff/team-velocity/` |
| **Current** | Apollo pixel saved with **Is Enabled = False**; no GTM publish |
| **Docs** | `backend/docs/EXTERNAL_AUTHORIZATION_REQUIRED.md` |

---

### 7. Railway backup schedule and error monitoring proof

| Field | Detail |
|-------|--------|
| **Required** | Confirm Postgres volume backup schedule in Railway dashboard; configure `ERROR_MONITORING_DSN` and verify alert delivery |
| **Code ready** | Observability instrumentation, metrics endpoint |
| **Docs** | `backend/docs/operations/disaster-recovery.md`, `backend/docs/OBSERVABILITY_CANARY.md` |

---

### 8. GitHub production environment and Railway token

| Field | Detail |
|-------|--------|
| **Required** | Production environment reviewers on GitHub; `RAILWAY_TOKEN` (and related secrets) in CI if not already provisioned |
| **Code ready** | `backend/.github/workflows/deploy.yml`, `scripts/provision-railway-production.sh` |

---

### 9. Verified dealership hours, phones, addresses, and origins

| Field | Detail |
|-------|--------|
| **Required** | Human-verified store hours, main phone, address, and **HTTPS website origins** per rooftop |
| **Code ready** | Onboarding JSON templates in `backend/config/production-onboarding/` |
| **Gate** | Populate `allowedOrigins` only after DNS/HTTPS verification |

---

### 10. Human employee canary execution

| Field | Detail |
|-------|--------|
| **Required** | Staff run employee test script on staging/production with backend-issued invite cookie |
| **Code ready** | `backend/docs/CANARY_EMPLOYEE_AUTH.md`, `docs/canary/employee-test-script.md` |
| **Not automated** | Requires human browser session on dealership network |

---

### 11. Business approval signatures

| Field | Detail |
|-------|--------|
| **Required** | Signed go/no-go from dealership leadership and AMQUR operator |
| **Templates** | `backend/docs/JEEP_OF_CHICAGO_INTERNAL_CANARY_APPROVAL.md`, `JEEP_OF_CHICAGO_PRODUCTION_RELEASE_APPROVAL.md` |

---

### 12. DNS ownership confirmation (if needed)

| Field | Detail |
|-------|--------|
| **Required** | Confirm `dialusnow.com` / widget CDN DNS remains under operator control; dealership origin DNS for CORS |
| **Docs** | `docs/deployment/dialusnow-dns-records.md` |

---

## Explicitly NOT listed here (already complete in repo)

- Truth engine, grounding guard, prompt injection defense
- Knowledge/RAG keyword hybrid + ingestion
- Widget UI (lead, handoff, branding, compare, saved, consent)
- Feature gates, capability fail-closed, tenant isolation
- Unit/integration test suites (224 backend + 35 widget)
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
