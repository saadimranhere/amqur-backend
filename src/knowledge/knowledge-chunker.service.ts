import { Injectable } from '@nestjs/common';

export type ChunkMetadata = {
  sourceId?: string | null;
  documentTitle?: string;
  canonicalUrl?: string | null;
  [key: string]: unknown;
};

export type TextChunk = {
  chunkIndex: number;
  content: string;
  tokenCount?: number;
  metadata: ChunkMetadata;
};

const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP = 100;

@Injectable()
export class KnowledgeChunkerService {
  splitText(
    text: string,
    metadata: ChunkMetadata = {},
    opts?: { chunkSize?: number; overlap?: number },
  ): TextChunk[] {
    const chunkSize = opts?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    const overlap = opts?.overlap ?? DEFAULT_OVERLAP;
    const normalized = text.replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    const chunks: TextChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < normalized.length) {
      let end = Math.min(start + chunkSize, normalized.length);
      if (end < normalized.length) {
        const breakAt = normalized.lastIndexOf('\n', end);
        if (breakAt > start + chunkSize * 0.5) {
          end = breakAt;
        }
      }
      const content = normalized.slice(start, end).trim();
      if (content) {
        chunks.push({
          chunkIndex: index,
          content,
          tokenCount: Math.ceil(content.length / 4),
          metadata: { ...metadata },
        });
        index += 1;
      }
      if (end >= normalized.length) break;
      start = Math.max(end - overlap, start + 1);
    }

    return chunks;
  }
}
