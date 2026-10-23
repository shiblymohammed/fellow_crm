import { PartialType } from '@nestjs/swagger';
import { CreateTenantBillingDto } from './create-tenant-billing.dto';

export class UpdateTenantBillingDto extends PartialType(CreateTenantBillingDto) {}
