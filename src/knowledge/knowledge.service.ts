import { Injectable } from '@nestjs/common';
import { KnowledgeStatus, KnowledgeVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeIngestionService } from './knowledge-ingestion.service';
import { KnowledgeRetrievalService } from './knowledge-retrieval.service';

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingestion: KnowledgeIngestionService,
    private readonly retrieval: KnowledgeRetrievalService,
  ) {}

  createDocument(params: {
    tenantId: string;
    locationId?: string | null;
    sourceId?: string | null;
    title: string;
    content: string;
    canonicalUrl?: string | null;
    visibility?: KnowledgeVisibility;
  }) {
    return this.ingestion.createDocumentWithChunks(params);
  }

  listDocuments(tenantId: string, locationId?: string) {
    return this.prisma.knowledgeDocument.findMany({
      where: {
        tenantId,
        ...(locationId ? { locationId } : {}),
        archivedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        visibility: true,
        version: true,
        locationId: true,
        sourceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  publishDocument(
    tenantId: string,
    documentId: string,
    approvedByUserId?: string,
  ) {
    return this.prisma.knowledgeDocument.updateMany({
      where: { id: documentId, tenantId },
      data: {
        status: KnowledgeStatus.PUBLISHED,
        approvedByUserId: approvedByUserId ?? null,
        approvedAt: new Date(),
      },
    });
  }

  search(params: Parameters<KnowledgeRetrievalService['search']>[0]) {
    return this.retrieval.search(params);
  }
}
