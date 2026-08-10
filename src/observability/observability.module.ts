import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { RetentionService } from './retention.service';

@Global()
@Module({
  providers: [MetricsService, RetentionService],
  controllers: [MetricsController],
  exports: [MetricsService, RetentionService],
})
export class ObservabilityModule {}
