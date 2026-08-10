import { Injectable } from '@nestjs/common';
import { TradeRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ProviderContext,
  TradeProvider,
} from '../integrations/contracts/provider.interfaces';

/** Stub — never invent appraisal values. */
export class DisabledTradeProvider implements TradeProvider {
  readonly name = 'disabled_trade';
  async isLiveReady(_ctx: ProviderContext): Promise<boolean> {
    return false;
  }
  async health(
    _ctx: ProviderContext,
  ): Promise<{ ok: boolean; detail?: string }> {
    return { ok: false, detail: 'trade_provider_disabled' };
  }
  async requestAppraisal(
    _ctx: ProviderContext,
    _payload: Record<string, unknown>,
  ): Promise<{
    verified: boolean;
    appraisalValue?: number;
  }> {
    return { verified: false };
  }
}

@Injectable()
export class TradeService {
  private readonly provider = new DisabledTradeProvider();

  constructor(private readonly prisma: PrismaService) {}

  getProvider(): TradeProvider {
    return this.provider;
  }

  async createRequest(params: {
    tenantId: string;
    locationId?: string | null;
    conversationId?: string | null;
    vin?: string | null;
    year?: number | null;
    make?: string | null;
    model?: string | null;
    trim?: string | null;
    mileage?: number | null;
    condition?: string | null;
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    notes?: string | null;
    photoFileIds?: string[];
  }) {
    return this.prisma.tradeRequest.create({
      data: {
        tenantId: params.tenantId,
        locationId: params.locationId ?? null,
        conversationId: params.conversationId ?? null,
        vin: params.vin?.toUpperCase().trim() ?? null,
        year: params.year ?? null,
        make: params.make ?? null,
        model: params.model ?? null,
        trim: params.trim ?? null,
        mileage: params.mileage ?? null,
        condition: params.condition ?? null,
        customerName: params.customerName ?? null,
        customerPhone: params.customerPhone ?? null,
        customerEmail: params.customerEmail ?? null,
        notes: params.notes ?? null,
        photoFileIds: params.photoFileIds ?? [],
        status: TradeRequestStatus.REQUESTED,
        appraisalVerified: false,
        appraisalValue: null,
      },
    });
  }

  /** Never invent appraisal — only returns verified values from provider. */
  async fetchVerifiedAppraisal(
    ctx: ProviderContext,
    requestId: string,
  ): Promise<{ verified: boolean; appraisalValue?: number }> {
    const ready = await this.provider.isLiveReady(ctx);
    if (!ready) return { verified: false };
    const result = await this.provider.requestAppraisal!(ctx, { requestId });
    if (result.verified && result.appraisalValue != null) {
      await this.prisma.tradeRequest.updateMany({
        where: { id: requestId, tenantId: ctx.tenantId },
        data: {
          appraisalVerified: true,
          appraisalValue: result.appraisalValue,
        },
      });
    }
    return result;
  }

  customerSafeMessage(): string {
    return (
      'I recorded your trade-in details for our team. ' +
      'I cannot provide an appraisal value until a verified appraisal is completed.'
    );
  }
}
