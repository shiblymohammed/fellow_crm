import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { BillingStatus } from '@prisma/client';

export class CreateTenantBillingDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(BillingStatus)
  status?: BillingStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
