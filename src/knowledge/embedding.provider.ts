/**
 * Embedding provider abstraction for future vector retrieval.
 * Keyword hybrid search is the production path today; vectors are optional.
 */
export type EmbeddingResult = {
  model: string;
  dimensions: number;
  vector: number[];
};

export interface EmbeddingProvider {
  readonly providerId: string;
  isAvailable(): boolean;
  embed(texts: string[]): Promise<EmbeddingResult[]>;
}

/** Fail-closed stub until OPENAI_API_KEY (or other) embedding is enabled. */
export class DisabledEmbeddingProvider implements EmbeddingProvider {
  readonly providerId = 'disabled';
  isAvailable(): boolean {
    return false;
  }
  async embed(_texts: string[]): Promise<EmbeddingResult[]> {
    return [];
  }
}
