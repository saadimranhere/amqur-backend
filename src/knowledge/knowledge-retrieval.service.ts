import { Injectable } from '@nestjs/common';
import { KnowledgeStatus, KnowledgeVisibility, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { neutralizePromptInjection } from './prompt-injection.util';

export type KnowledgeSearchResult = {
  chunkId: string;
  documentId: string;
  title: string;
  content: string;
  score: number;
  injectionNeutralized: boolean;
  metadata?: Record<string, unknown> | null;
};

const RELEVANCE_THRESHOLD = 0.15;
const MAX_RESULTS = 10;

@Injectable()
export class KnowledgeRetrievalService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    tenantId: string;
    locationId?: string | null;
    query: string;
    forWidget?: boolean;
    limit?: number;
  }): Promise<KnowledgeSearchResult[]> {
    const q = params.query.trim();
    if (!q) return [];

    const now = new Date();
    const visibility = params.forWidget
      ? KnowledgeVisibility.CUSTOMER
      : undefined;
    const statuses = params.forWidget
      ? [KnowledgeStatus.PUBLISHED, KnowledgeStatus.APPROVED]
      : [
          KnowledgeStatus.PUBLISHED,
          KnowledgeStatus.APPROVED,
          KnowledgeStatus.DRAFT,
        ];

    const keywords = q
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    if (keywords.length === 0) return [];

    const contentOr: Prisma.KnowledgeChunkWhereInput[] = keywords.map((kw) => ({
      content: { contains: kw, mode: 'insensitive' as const },
    }));

    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: {
        tenantId: params.tenantId,
        AND: [
          {
            OR: [
              { locationId: null },
              ...(params.locationId ? [{ locationId: params.locationId }] : []),
            ],
          },
          { OR: contentOr },
        ],
        document: {
          tenantId: params.tenantId,
          status: { in: statuses },
          ...(visibility ? { visibility } : {}),
          AND: [
            {
              OR: [{ effectiveAt: null }, { effectiveAt: { lte: now } }],
            },
            {
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
          ],
        },
      },
      include: {
        document: { select: { id: true, title: true, metadata: true } },
      },
      take: (params.limit ?? MAX_RESULTS) * 3,
    });

    const scored = chunks
      .map((chunk) => {
        const lower = chunk.content.toLowerCase();
        const hits = keywords.filter((kw) => lower.includes(kw)).length;
        const score = hits / keywords.length;
        return { chunk, score };
      })
      .filter((r) => r.score >= RELEVANCE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, params.limit ?? MAX_RESULTS);

    return scored.map(({ chunk, score }) => {
      const neutralized = neutralizePromptInjection(chunk.content);
      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        title: chunk.document.title,
        content: neutralized.text,
        score,
        injectionNeutralized: neutralized.injectionDetected,
        metadata: {
          ...(typeof chunk.metadata === 'object' && chunk.metadata !== null
            ? (chunk.metadata as Record<string, unknown>)
            : {}),
          ...(typeof chunk.document.metadata === 'object' &&
          chunk.document.metadata !== null
            ? (chunk.document.metadata as Record<string, unknown>)
            : {}),
          treatAsData: true,
        },
      };
    });
  }
}
