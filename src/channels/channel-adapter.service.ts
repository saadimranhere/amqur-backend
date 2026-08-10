import { Injectable, Logger } from '@nestjs/common';
import type {
  InboundChannelMessage,
  OutboundChannelMessage,
  MessagingProvider as ChannelMessagingProvider,
} from '../channels/channel.types';

/** Stub Twilio signature validator — wire when SMS goes live. */
@Injectable()
export class TwilioSignatureValidator {
  validate(_params: {
    signature: string | undefined;
    url: string;
    body: Record<string, string>;
  }): boolean {
    return false;
  }
}

/** Mock provider that never sends — avoids circular deps with ChatOrchestrator. */
export class MockMessagingProvider implements ChannelMessagingProvider {
  readonly providerId = 'mock_messaging';
  readonly channel = 'SMS' as const;

  isLiveConfigured(): boolean {
    return false;
  }

  async send(
    _message: OutboundChannelMessage,
  ): Promise<{ ok: boolean; externalId?: string }> {
    return { ok: false };
  }
}

export type ChannelRouteResult = {
  handled: boolean;
  channel: InboundChannelMessage['channel'];
  reason: string;
};

@Injectable()
export class ChannelAdapterService {
  private readonly logger = new Logger(ChannelAdapterService.name);
  private readonly mockProvider = new MockMessagingProvider();

  constructor(private readonly twilioValidator: TwilioSignatureValidator) {}

  /**
   * Normalizes inbound channel messages and routes to downstream handlers.
   * ChatOrchestrator wiring is deferred to avoid circular module dependencies.
   */
  async routeInbound(
    message: InboundChannelMessage,
  ): Promise<ChannelRouteResult> {
    this.logger.debug(
      `Inbound ${message.channel} message for tenant=${message.tenantId}`,
    );

    if (message.channel === 'SMS') {
      const valid = this.twilioValidator.validate({
        signature:
          typeof message.metadata?.twilioSignature === 'string'
            ? message.metadata.twilioSignature
            : undefined,
        url:
          typeof message.metadata?.webhookUrl === 'string'
            ? message.metadata.webhookUrl
            : '',
        body: {},
      });
      if (!valid) {
        return {
          handled: false,
          channel: message.channel,
          reason: 'invalid_twilio_signature',
        };
      }
    }

    // Orchestrator integration point — return pending until wired.
    return {
      handled: false,
      channel: message.channel,
      reason: 'orchestrator_not_wired',
    };
  }

  getMockMessagingProvider(): MockMessagingProvider {
    return this.mockProvider;
  }
}
