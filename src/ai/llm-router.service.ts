import { Injectable, Logger } from '@nestjs/common';
import { AnthropicLlmProvider } from './anthropic-llm.provider';
import { OpenAiLlmProvider } from './openai-llm.provider';
import type { LlmGenerateParams, LlmGenerateResult } from './llm.provider';
import { MetricsService } from '../observability/metrics.service';

/**
 * Routes LLM calls with primary→fallback degradation.
 * Non-LLM paths (inventory, leads, handoff) must remain usable when this fails.
 */
@Injectable()
export class LlmRouterService {
  private readonly logger = new Logger(LlmRouterService.name);

  constructor(
    private readonly anthropic: AnthropicLlmProvider,
    private readonly openai: OpenAiLlmProvider,
    private readonly metrics: MetricsService,
  ) {}

  isAvailable(): boolean {
    return this.anthropic.isAvailable() || this.openai.isAvailable();
  }

  async generate(params: LlmGenerateParams): Promise<LlmGenerateResult | null> {
    const order = [this.anthropic, this.openai].filter((p) => p.isAvailable());
    if (order.length === 0) {
      this.metrics.increment('ai.llm.unavailable');
      return null;
    }
    for (const provider of order) {
      try {
        const result = await provider.generate(params);
        this.metrics.increment('ai.llm.success');
        return result;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`LLM provider ${provider.providerId} failed: ${msg}`);
        this.metrics.increment('ai.llm.failure');
      }
    }
    return null;
  }
}
