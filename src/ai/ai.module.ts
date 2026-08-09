import { Global, Module } from '@nestjs/common';
import { AnthropicLlmProvider } from './anthropic-llm.provider';
import { OpenAiLlmProvider } from './openai-llm.provider';
import { LlmRouterService } from './llm-router.service';

@Global()
@Module({
  providers: [AnthropicLlmProvider, OpenAiLlmProvider, LlmRouterService],
  exports: [AnthropicLlmProvider, OpenAiLlmProvider, LlmRouterService],
})
export class AiModule {}
