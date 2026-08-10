import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Soft data retention — archives aged conversations/messages per tenant policy.
 * Never deletes audit logs here; ops can extend for hard-delete with legal review.
 */
@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runScheduled(): Promise<void> {
    if (process.env.PROCESS_ROLE === 'api') return;
    await this.enforceRetention();
  }

  async enforceRetention(): Promise<{ tenantsProcessed: number }> {
    const tenants = await this.prisma.tenant.findMany({
      select: { id: true, slug: true, dataRetentionDays: true },
    });
    let tenantsProcessed = 0;
    for (const t of tenants) {
      const days = t.dataRetentionDays > 0 ? t.dataRetentionDays : 365;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const conversations = await this.prisma.conversation.findMany({
        where: {
          tenantId: t.id,
          updatedAt: { lt: cutoff },
        },
        select: { id: true },
        take: 500,
      });
      if (conversations.length === 0) continue;
      const ids = conversations.map((c) => c.id);
      await this.prisma.message.deleteMany({
        where: { conversationId: { in: ids } },
      });
      await this.prisma.conversation.deleteMany({
        where: { id: { in: ids }, tenantId: t.id },
      });
      this.logger.log(
        `Retention tenant=${t.slug} removedConversations=${ids.length} cutoff=${cutoff.toISOString()}`,
      );
      tenantsProcessed += 1;
    }
    return { tenantsProcessed };
  }
}
