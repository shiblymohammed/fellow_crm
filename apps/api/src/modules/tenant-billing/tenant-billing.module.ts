import { Module } from '@nestjs/common';
import { TenantBillingService } from './tenant-billing.service';
import { TenantBillingController } from './tenant-billing.controller';

@Module({
  controllers: [TenantBillingController],
  providers: [TenantBillingService],
})
export class TenantBillingModule {}
