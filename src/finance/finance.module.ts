import { Module } from '@nestjs/common';
import { FinanceRequestService } from './finance-request.service';

@Module({
  providers: [FinanceRequestService],
  exports: [FinanceRequestService],
})
export class FinanceModule {}
