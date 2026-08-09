import { Global, Module } from '@nestjs/common';
import { KnowledgeChunkerService } from './knowledge-chunker.service';
import { KnowledgeIngestionService } from './knowledge-ingestion.service';
import { KnowledgeRetrievalService } from './knowledge-retrieval.service';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { WebsiteIngestionService } from './website-ingestion.service';
import { DisabledEmbeddingProvider } from './embedding.provider';

@Global()
@Module({
  controllers: [KnowledgeController],
  providers: [
    KnowledgeChunkerService,
    KnowledgeIngestionService,
    KnowledgeRetrievalService,
    KnowledgeService,
    WebsiteIngestionService,
    { provide: 'EmbeddingProvider', useClass: DisabledEmbeddingProvider },
  ],
  exports: [
    KnowledgeChunkerService,
    KnowledgeIngestionService,
    KnowledgeRetrievalService,
    KnowledgeService,
    WebsiteIngestionService,
  ],
})
export class KnowledgeModule {}
