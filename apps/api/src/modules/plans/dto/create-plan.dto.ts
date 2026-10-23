import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';

export enum BillingCycle {
  monthly = 'monthly',
  quarterly = 'quarterly',
  annual = 'annual',
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString({ each: true })
  features?: string[];
}
