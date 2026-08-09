# Knowledge Retrieval — Current vs Future

**Date:** 2026-08-09  
**Status:** CODE_COMPLETE (keyword/hybrid production path)

## Current production retrieval (no embeddings required)

| Capability | Implementation |
|------------|----------------|
| Ingestion | `KnowledgeIngestionService` — checksum, chunking, tenant-scoped documents |
| Chunking | `KnowledgeChunkerService` — ~800 char chunks with overlap + provenance metadata |
| Search | `KnowledgeRetrievalService.search` — case-insensitive keyword hybrid scoring |
| Tenant scope | `KnowledgeChunk.tenantId` + `document.tenantId` required |
| Location scope | `locationId` null (tenant-wide) OR match |
| Visibility | Widget path forces `CUSTOMER` |
| Status | Widget: `PUBLISHED` / `APPROVED` only |
| Temporal | `effectiveAt` / `expiresAt` filters |
| Relevance | Score = keyword hit ratio; threshold `0.15` |
| Injection defense | `neutralizePromptInjection` — treat content as DATA |
| Website ingest | Allowlisted hosts only + SSRF guard → DRAFT pending approval |

Embeddings are **not** consulted at runtime today. A disabled `EmbeddingProvider` stub exists for a future upgrade.

## Future optional enhancement

- Persist vectors on `KnowledgeChunk.embedding` (JSON today)
- Optional `pgvector` migration when all deploy environments support the extension
- Hybrid rank: keyword + cosine similarity

Until then, keyword/hybrid is the complete, production-capable retrieval path.
