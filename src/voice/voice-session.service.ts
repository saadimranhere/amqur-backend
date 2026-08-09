import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DisabledVoiceProvider } from '../integrations/voice/voice.provider';
import type { VoiceSession } from '../integrations/voice/voice.provider';

@Injectable()
export class VoiceSessionService {
  private readonly provider = new DisabledVoiceProvider();

  constructor(private readonly prisma: PrismaService) {}

  getProvider() {
    return this.provider;
  }

  async upsertSession(params: {
    tenantId: string;
    locationId?: string | null;
    externalCallId: string;
    direction: string;
    state: string;
    fromNumber?: string | null;
    toNumber?: string | null;
    recordingConsent?: boolean;
    language?: string | null;
    conversationExternalKey?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.voiceCallSession.upsert({
      where: {
        tenantId_externalCallId: {
          tenantId: params.tenantId,
          externalCallId: params.externalCallId,
        },
      },
      create: {
        tenantId: params.tenantId,
        locationId: params.locationId ?? null,
        externalCallId: params.externalCallId,
        direction: params.direction,
        state: params.state,
        fromNumber: params.fromNumber ?? null,
        toNumber: params.toNumber ?? null,
        recordingConsent: params.recordingConsent ?? false,
        language: params.language ?? null,
        conversationExternalKey: params.conversationExternalKey ?? null,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
      update: {
        state: params.state,
        fromNumber: params.fromNumber ?? null,
        toNumber: params.toNumber ?? null,
        recordingConsent: params.recordingConsent ?? false,
        language: params.language ?? null,
        conversationExternalKey: params.conversationExternalKey ?? null,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async endSession(tenantId: string, externalCallId: string, summary?: string) {
    return this.prisma.voiceCallSession.update({
      where: {
        tenantId_externalCallId: { tenantId, externalCallId },
      },
      data: {
        state: 'COMPLETED',
        endedAt: new Date(),
        summary: summary ?? null,
      },
    });
  }

  /** Never live — provider is disabled. */
  async handleInbound(_session: VoiceSession) {
    return this.provider.answer();
  }
}
