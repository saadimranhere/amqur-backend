# Final Release Checklist

**Date:** 2026-08-09  
**Target:** Internal canary / controlled rollout (not public traffic)  
**Branch:** `feat/platform-completion-100`

Use this checklist before enabling any capability beyond current fail-closed production state.

---

## A. Repository verification

- [ ] Backend on `feat/platform-completion-100` (or merged equivalent)
- [ ] Widget on `feat/platform-completion-100` (or merged equivalent)
- [ ] `npm ci && npm test` — backend **224/224** unit tests pass
- [ ] Widget **35/35** tests pass; `npm run build` succeeds
- [ ] `npx tsc --noEmit` clean (backend + widget)
- [ ] `npx prisma migrate status` — up to date
- [ ] `backend/test/evidence/final-completion-report.json` reflects current counts
- [ ] No secrets in git diff

---

## B. CI / deployment

- [ ] GitHub Actions CI green on release SHA
- [ ] Docker images build successfully
- [ ] `scripts/verify-release.sh` passes
- [ ] Production environment reviewers configured (GitHub)
- [ ] `RAILWAY_TOKEN` and deploy secrets present in CI
- [ ] Deploy SHA recorded matches tested SHA

---

## C. Production fail-closed baseline

- [ ] `GET /api/health` → 200 on `api.dialusnow.com`
- [ ] `GET /api/version` → `env=production`
- [ ] All 6 tenants return widget-config 200 with safe public payload
- [ ] No internal IDs or secrets in widget-config JSON
- [ ] `allowedOrigins` empty on all tenants
- [ ] Widget-token without Origin → **403**
- [ ] Widget-token with evil origin → **403**
- [ ] Bootstrap registration → **403**
- [ ] Inventory, payments, service flags **disabled** per tenant
- [ ] Run fail-closed script; evidence updated in `test/evidence/production-failclosed-latest.json`

---

## D. Security (see FINAL_SECURITY_REVIEW.md)

- [ ] Tenant isolation e2e-style tests pass
- [ ] JWT auth + roles guards verified
- [ ] Feed URL SSRF guard active (`assertFeedUrlAllowed`)
- [ ] Prompt injection util tests pass
- [ ] Grounding guard tests pass
- [ ] Upload MIME allowlist enforced (jpeg, png, webp, pdf)
- [ ] No secrets logged (grep production logs sample)
- [ ] Capability service fail-closed defaults confirmed

---

## E. External dependencies (must be ready before opening gates)

Reference: `docs/EXTERNAL_ACTIVATION_HANDOFF.md`

- [ ] Tekion credentials + docs (if enabling DMS)
- [ ] Inventory feed URL + credentials (if enabling inventory)
- [ ] `CRM_WEBHOOK_URL` (if enabling live handoff notify)
- [ ] Twilio/Meta (if enabling SMS/WhatsApp)
- [ ] Voice vendor (if enabling voice)
- [ ] Verified origins per tenant
- [ ] GTM/Team Velocity install permission
- [ ] Business approval signed
- [ ] Employee canary script executed by human

---

## F. Observability and operations

- [ ] Metrics endpoint reachable (internal)
- [ ] `ERROR_MONITORING_DSN` configured; test alert fired
- [ ] Railway Postgres backup schedule confirmed in dashboard
- [ ] Rollback plan reviewed (`docs/operations/ROLLBACK.md`)
- [ ] On-call / escalation contacts documented
- [ ] Worker process healthy (outbox processor running)

---

## G. Widget / CDN

- [ ] `widget.dialusnow.com` serves IIFE with `application/javascript`
- [ ] `version.json` SHA matches deployed widget
- [ ] Canary loader available if using Apollo path
- [ ] Staging banner **not** present on production bundle
- [ ] Widget contract tests pass against production API schema

---

## H. Go / no-go decision

| Role | Name | Date | Decision |
|------|------|------|----------|
| AMQUR engineering | | | |
| Dealership IT | | | |
| Dealership leadership | | | |

**Minimum for internal canary:** A + B + C + D + F + G complete; E items scoped to canary tenant only.

**Minimum for public traffic:** All sections complete + signed H + incremental origin enablement.

---

## Post-release monitoring (first 24h)

- [ ] Error rate baseline established
- [ ] No unexpected 403/401 spikes on public endpoints
- [ ] Outbox DEAD letter queue empty
- [ ] Lead/escalation records persisting correctly
- [ ] Chat responses grounded (no inventable claims when inventory off)
