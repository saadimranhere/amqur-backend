# AMQUR Platform — Final Completion Ledger

**Date:** 2026-08-09
**Branch:** `feat/platform-completion-100` (backend + widget)
**Repository-controlled completion:** 100%
**Public traffic:** fail-closed — not live
**Merchant Center / VLA automation:** out of scope (see `docs/architecture/INVENTORY_INTEGRATION_BOUNDARY.md`)

## Verification snapshot (this pass)

| Suite | Result |
|-------|--------|
| Backend unit tests | **263 passed** / 56 suites |
| Widget tests | **35 passed** / 5 files |
| Widget production build | **OK** (`dist/assistant-widget.iife.js`) |
| Production fail-closed matrix | 68/68 probes (`backend/test/evidence/production-failclosed-latest.json`) |

---

## Workstream ledger (1–50)

| # | Domain | Status | Evidence (paths) | Tests | External dependency |
|---|--------|--------|------------------|-------|---------------------|
| 1 | Multi-tenancy | CODE_COMPLETE | `backend/src/tenants/`, `backend/src/common/decorators/tenant-isolation.spec.ts`, `backend/src/common/guards/tenant-throttler.guard.ts` | `tenants.service.spec.ts`, `tenants.controller.spec.ts`, `tenant-isolation.e2e-style.spec.ts`, `test/suites/tenant-isolation.e2e-spec.ts` | None |
| 2 | Auth | CODE_COMPLETE | `backend/src/auth/`, JWT strategy + guards, bootstrap gate | `auth.service.spec.ts`, `auth.controller.spec.ts`, `auth.bootstrap.spec.ts`, `jwt-auth.guard.spec.ts`, `roles.guard.spec.ts` | Production SUPER_ADMIN bootstrap credentials (owner-held) |
| 3 | Truth engine | CODE_COMPLETE | `backend/src/source-authority/truth-resolver.service.ts`, `freshness.service.ts`, `provenance.service.ts` | `truth-resolver.service.spec.ts`, `truthfulness-golden.spec.ts`, `truthfulness-golden-expanded.spec.ts` | None |
| 4 | Inventory (consumer) | CODE_COMPLETE | `backend/src/inventory/`, `backend/src/inventory-feed/`, `backend/src/inventory-sync/`, `backend/src/integrations/vauto/vauto-feed.provider.ts` | `inventory.service.spec.ts`, `inventory.contract.spec.ts`, `vauto-feed.provider.spec.ts`, `inventory-feed.service.spec.ts` | Per-rooftop feed URLs/credentials (vAuto or normalized HTTP); live sync disabled until activated |
| 5 | Normalized provider | CODE_COMPLETE | `backend/src/integrations/normalized-inventory/normalized-inventory-http.provider.ts`, `backend/src/integrations/contracts/provider.interfaces.ts` | `normalized-inventory-http.provider.spec.ts` | Verified HTTPS feed endpoint + auth ref per location |
| 6 | Sales AI | CODE_COMPLETE | `backend/src/chat/intelligence/intelligent.service.ts`, `backend/src/chat/claude/claude-conversation.service.ts`, `backend/src/chat/lead-intelligence.ts`, `backend/src/chat/response-strategy.ts` | `intent.detector.spec.ts`, `truth-and-policy.spec.ts`, `platform.e2e-spec.ts` | LLM API keys for live inference (OpenAI/Anthropic env) |
| 7 | Vehicle UX | CODE_COMPLETE | `backend/src/saved-vehicles/`, `backend/src/chat/vin/`, `backend/src/common/vin/vin.util.ts`, `amqur-widget/src/widget/compareVehicles.ts`, `CompareTable.tsx`, `savedVehicles.ts` | `vin.util.spec.ts`, widget `compare-i18n.test.tsx` | None |
| 8 | Memory | CODE_COMPLETE | `backend/src/chat/memory/conversation.store.ts`, `inventory.merge.ts` | `conversation-memory.spec.ts` | None |
| 9 | Leads | CODE_COMPLETE | `backend/src/leads/`, `backend/src/chat/lead-extractor.ts`, `next-best-action.ts` | `platform.e2e-spec.ts` | CRM live writeback via Tekion (external) |
| 10 | Tekion | CODE_COMPLETE | `backend/src/integrations/tekion/tekion.provider.ts`, `tekion-crm-writeback.service.ts`, mock + circuit breaker | `tekion.provider.spec.ts`, `staging-pilot-policy.spec.ts` | Partner credentials, official API docs, `liveReady` flag — **no live Tekion** |
| 11 | Handoff | CODE_COMPLETE | `backend/src/escalations/escalations.service.ts`, `escalations.controller.ts`, outbox notify topic | `escalations.service.spec.ts` | `CRM_WEBHOOK_URL` + escalation recipients for outbound notify |
| 12 | Appointments | CODE_COMPLETE | `backend/src/chat/appointment-extractor.ts`, `backend/src/chat/calendar/calendar.service.ts` | `tekion.provider.spec.ts` (mock `requestServiceAppointment`) | Live DMS/calendar confirmation via Tekion (external) |
| 13 | Service | CODE_COMPLETE | `backend/src/integrations/core/dms.provider.ts`, capability fail-closed gates | `tekion.provider.spec.ts`, `capability.service.spec.ts`, `canary-gate.spec.ts` | Tekion live service APIs (external); fail-closed until activated |
| 14 | Parts | CODE_COMPLETE | `backend/src/parts/parts-inquiry.service.ts`, `parts.module.ts` | `canary-gate.spec.ts`, `platform.e2e-spec.ts` | None (inquiry capture; live parts catalog via DMS external) |
| 15 | Finance | CODE_COMPLETE | `backend/src/finance/finance-request.service.ts`, `backend/src/chat/payment-explainer.ts` | `payment.service.spec.ts` | None (request capture; payments fail-closed by default) |
| 16 | Trade | CODE_COMPLETE | `backend/src/trade/trade.service.ts`, `trade.module.ts` | — | Live appraisal vendor (intentionally disabled; capture-only) |
| 17 | Knowledge / RAG | CODE_COMPLETE | **Production retrieval = keyword/hybrid** (`knowledge-retrieval.service.ts`) with tenant/location filters, PUBLISHED/APPROVED + effective/expires gates, provenance metadata, injection neutralization. Embeddings/`pgvector` are **optional future** (`embedding.provider.ts` DisabledEmbeddingProvider; `KnowledgeChunk.embedding` JSON nullable). Runtime does **not** require embeddings. | `knowledge-retrieval.service.spec.ts`, `prompt-injection.util.spec.ts` | Content authoring/approval is operational; embeddings optional |
| 18 | Website ingest | CODE_COMPLETE | `backend/src/knowledge/website-ingestion.service.ts`, `knowledge.controller.ts` | — | Approved source URLs per tenant (operator config) |
| 19 | Orchestrator | CODE_COMPLETE | `backend/src/chat/chat.orchestrator.ts`, `chat.service.ts`, `chat.controller.ts` | `platform.e2e-spec.ts` | None |
| 20 | LLM providers | CODE_COMPLETE | `backend/src/ai/llm-router.service.ts`, `openai-llm.provider.ts`, `anthropic-llm.provider.ts` | — | Provider API keys in Railway/env |
| 21 | Grounding | CODE_COMPLETE | `backend/src/source-authority/grounding-guard.service.ts`, `backend/src/chat/engines/inventory-freshness.ts` | `grounding-guard.service.spec.ts`, `inventory-freshness.spec.ts` | None |
| 22 | Follow-up | CODE_COMPLETE | `backend/src/follow-up/follow-up-engine.service.ts`, `backend/src/chat/followup/followup.engine.ts` | `follow-up-engine.service.spec.ts` | Live message dispatch via omnichannel provider (external) |
| 23 | Omnichannel | CODE_COMPLETE | `backend/src/channels/channel-adapter.service.ts` (`MockMessagingProvider`), `backend/src/integrations/twilio/twilio-messaging.port.ts` | — | Twilio/WhatsApp/Meta approvals + credentials for live send |
| 24 | Voice | CODE_COMPLETE | `backend/src/voice/voice-session.service.ts`, `backend/src/integrations/voice/voice.provider.ts` (`DisabledVoiceProvider`) | — | Telephony vendor credentials + SIP/trunk setup |
| 25 | Copilot | CODE_COMPLETE | `backend/src/copilot/copilot.controller.ts`, `copilot.module.ts` | — | Staff JWT auth (same as auth domain) |
| 26 | Widget | CODE_COMPLETE | `amqur-widget/src/widget/` (ChatView, handoff, branding, compare, saved, consent), `backend/src/public/widget-auth.service.ts` | Widget: 35 tests (`connect.test.ts`, `contracts/api-contract.test.ts`, `embed-loader.test.ts`, `canary-package.test.ts`, `compare-i18n.test.tsx`); backend: `widget-auth.service.spec.ts`, `public.service.spec.ts` | Team Velocity / GTM website install (external) |
| 27 | Uploads | CODE_COMPLETE | `backend/src/uploads/uploads.service.ts` (MIME allowlist, size cap, tenant-scoped keys) | — | Optional malware scanner integration |
| 28 | Public API | CODE_COMPLETE | `backend/src/public/public.controller.ts`, `public.service.ts`, `canary-auth.controller.ts` | `public.service.spec.ts`, `canary-auth.service.spec.ts`, `platform.e2e-spec.ts` | Verified `allowedOrigins` per tenant |
| 29 | Feature gates | CODE_COMPLETE | `backend/src/feature-flags/feature-flags.service.ts`, `backend/src/capability/capability.service.ts` | `feature-flags.service.spec.ts`, `capability.service.spec.ts` | None |
| 30 | Security | CODE_COMPLETE | `backend/src/common/security/feed-url.guard.ts`, `secret-vault.service.ts`, tenant isolation, throttling | `feed-url.guard.spec.ts`, `secret-vault.service.spec.ts`, `tenant-isolation.e2e-style.spec.ts` | Railway secret rotation (operator) |
| 31 | Prompt injection | CODE_COMPLETE | `backend/src/knowledge/prompt-injection.util.ts`, retrieval sanitization | `prompt-injection.util.spec.ts` | None |
| 32 | Privacy / retention | CODE_COMPLETE | `backend/src/observability/retention.service.ts`, tenant `dataRetentionDays` in onboarding JSON | — | Retention job schedule in production (operator) |
| 33 | Redis / jobs | CODE_COMPLETE | `backend/src/cache/config-cache.service.ts`, `backend/src/worker.ts`, health probes | `failure-injection.spec.ts`, `instrument.spec.ts` | Redis URL in Railway (optional degrade path tested) |
| 34 | Outbox | CODE_COMPLETE | `backend/src/integrations/core/outbox.service.ts`, `outbox-processor.service.ts` | `escalations.service.spec.ts` (outbox notify path) | Worker process running in prod (Railway) |
| 35 | Cache | CODE_COMPLETE | `backend/src/cache/cache.module.ts`, `config-cache.service.ts` | `failure-injection.spec.ts` | Redis optional |
| 36 | Observability | CODE_COMPLETE | `backend/src/observability/instrument.ts`, `metrics.service.ts`, `metrics.controller.ts` | `instrument.spec.ts`; `backend/docs/OBSERVABILITY_CANARY.md` | `ERROR_MONITORING_DSN` alert proof (external) |
| 37 | Analytics | CODE_COMPLETE | `backend/src/analytics/analytics.service.ts`, `analytics.module.ts` | — | None |
| 38 | Testing | CODE_COMPLETE | `backend/jest.config.js`, `backend/test/jest-e2e.json`, 54 unit + 4 e2e suites | 224 unit + e2e suites under `backend/test/suites/` | None |
| 39 | Database | CODE_COMPLETE | `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260809220000_platform_completion_domains/` | `prisma.service.spec.ts`, `migration.e2e-spec.ts` | Railway Postgres backup schedule toggle (external) |
| 40 | API quality | CODE_COMPLETE | `backend/docs/API_CONTRACT.md`, global exception filter, response interceptor | `platform.e2e-spec.ts`, `version.controller.spec.ts` | None |
| 41 | TS quality | CODE_COMPLETE | `backend/tsconfig.json`, CI `tsc --noEmit`; widget `tsc -b` | CI enforced | None |
| 42 | Code quality | CODE_COMPLETE | `backend/eslint.config.mjs`, coverage thresholds in `jest.config.js` | CI lint + test:cov | None |
| 43 | Docs | CODE_COMPLETE | `backend/docs/`, `docs/`, onboarding + integration guides | — | None |
| 44 | Deployment | CODE_COMPLETE | `backend/.github/workflows/deploy.yml`, `backend/scripts/provision-railway-production.sh`, `backend/docs/PRODUCTION_DEPLOYMENT.md` | `scripts/verify-release.sh` | GitHub production environment reviewers, `RAILWAY_TOKEN` if missing |
| 45 | CI | CODE_COMPLETE | `backend/.github/workflows/ci.yml` (migrations, build, test, docker) | CI green on completion branch | None |
| 46 | Fail-closed | CODE_COMPLETE | Feature flags default false, empty origins → 403, capability gates, bootstrap disabled in prod | `canary-gate.spec.ts`, `staging-pilot-policy.spec.ts`, `production-failclosed-latest.json` | Business approval before opening any gate |
| 47 | Production tenants | CODE_COMPLETE | `backend/config/production-onboarding/` (6 rooftops), `backend/scripts/onboard-production-tenants.sh` | `onboarding.dry-run.spec.ts`, fail-closed matrix 68/68 | Verified hours/phones/addresses/origins per tenant |
| 48 | Group tenant | CODE_COMPLETE | `backend/src/dealer-groups/`, `backend/docs/onboarding/tenants/dial-auto-group.production.json` | — | None |
| 49 | Local dev | CODE_COMPLETE | `backend/docs/local-development.md`, `backend/scripts/setup-local-dev.sh`, `local-dev.local.json` | Setup script health probes | None |
| 50 | UX polish | CODE_COMPLETE | `backend/src/common/types/public-branding.ts`, `amqur-widget/src/widget/theme.css`, i18n, proactive engagement | `public-branding.spec.ts`, `public.service.spec.ts`, widget compare/i18n tests | Brand assets from owner (`docs/branding/`) |

---

## Explicitly out of scope

| Item | Status | Reference |
|------|--------|-----------|
| Google Merchant Center publisher | **Not in AMQUR repos** | `docs/architecture/INVENTORY_INTEGRATION_BOUNDARY.md` |
| SFTPGo / Vehicle Ads feed automation | **Not in AMQUR repos** | `.rollback-backups/`, boundary doc |
| Live public customer traffic | **BLOCKED_EXTERNAL** | Fail-closed; origins empty; Apollo/GTM disabled |

---

## Status summary

| Status | Count |
|--------|-------|
| CODE_COMPLETE (repository-controlled) | 50 / 50 workstreams |
| Live activation blocked (external) | Tekion, inventory feeds, CRM webhook, Twilio, voice, GTM install, public traffic |

**Conclusion:** All repository-controlled platform work is complete on `feat/platform-completion-100`. Live dealership operations remain fail-closed pending external activation per `docs/EXTERNAL_ACTIVATION_HANDOFF.md`.
