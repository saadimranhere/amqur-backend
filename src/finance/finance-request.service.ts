import { Injectable } from '@nestjs/common';
import { FinanceRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Finance request capture — never invents APR/approval.
 * Educational estimates remain in PaymentService.
 */
@Injectable()
export class FinanceRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    tenantId: string;
    locationId?: string | null;
    conversationId?: string | null;
    vehicleVin?: string | null;
    desiredPayment?: number | null;
    downPayment?: number | null;
    termMonths?: number | null;
    leaseOrPurchase?: string | null;
    tradeInterest?: boolean;
    aprProvided?: number | null;
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    notes?: string | null;
  }) {
    return this.prisma.financeRequest.create({
      data: {
        tenantId: params.tenantId,
        locationId: params.locationId ?? null,
        conversationId: params.conversationId ?? null,
        vehicleVin: params.vehicleVin?.toUpperCase().trim() ?? null,
        desiredPayment: params.desiredPayment ?? null,
        downPayment: params.downPayment ?? null,
        termMonths: params.termMonths ?? null,
        leaseOrPurchase: params.leaseOrPurchase ?? null,
        tradeInterest: params.tradeInterest ?? false,
        // Only store APR when explicitly provided — never invent.
        aprProvided: params.aprProvided ?? null,
        customerName: params.customerName ?? null,
        customerPhone: params.customerPhone ?? null,
        customerEmail: params.customerEmail ?? null,
        notes: params.notes ?? null,
        status: FinanceRequestStatus.REQUESTED,
      },
    });
  }
}
