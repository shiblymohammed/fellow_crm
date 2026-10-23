import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum TenantStatus {
  active = 'active',
  suspended = 'suspended',
  expired = 'expired',
  trial = 'trial',
}

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsEmail()
  ownerEmail: string;

  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
