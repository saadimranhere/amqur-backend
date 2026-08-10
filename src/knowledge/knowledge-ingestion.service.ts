import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { KnowledgeStatus, KnowledgeVisibility, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeChunkerService } from './knowledge-chunker.service';

@Injectable()
export class KnowledgeIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chunker: KnowledgeChunkerService,
  ) {}

  checksum(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  async createDocumentWithChunks(params: {
    tenantId: string;
    locationId?: string | null;
    sourceId?: string | null;
    title: string;
    content: string;
    canonicalUrl?: string | null;
    visibility?: KnowledgeVisibility;
    status?: KnowledgeStatus;
    metadata?: Record<string, unknown>;
  }) {
    const contentChecksum = this.checksum(params.content);
    const chunks = this.chunker.splitText(params.content, {
      sourceId: params.sourceId,
      documentTitle: params.title,
      canonicalUrl: params.canonicalUrl,
    });

    return this.prisma.$transaction(async (tx) => {
      const document = await tx.knowledgeDocument.create({
        data: {
          tenantId: params.tenantId,
          locationId: params.locationId ?? null,
          sourceId: params.sourceId ?? null,
          title: params.title,
          content: params.content,
          contentChecksum,
          canonicalUrl: params.canonicalUrl ?? null,
          visibility: params.visibility ?? KnowledgeVisibility.STAFF,
          status: params.status ?? KnowledgeStatus.DRAFT,
          metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });

      if (chunks.length > 0) {
        await tx.knowledgeChunk.createMany({
          data: chunks.map((c) => ({
            tenantId: params.tenantId,
            documentId: document.id,
            locationId: params.locationId ?? null,
            chunkIndex: c.chunkIndex,
            content: c.content,
            tokenCount: c.tokenCount,
            metadata: c.metadata as Prisma.InputJsonValue,
          })),
        });
      }

      return document;
    });
  }
}
