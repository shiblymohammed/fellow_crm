import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { VisaStatus } from '@prisma/client';

export class UpdateVisaApplicationDto {
  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  visaType?: string;

  @IsEnum(VisaStatus)
  @IsOptional()
  status?: VisaStatus;

  @IsDateString()
  @IsOptional()
  submittedAt?: string;

  @IsDateString()
  @IsOptional()
  expectedDate?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: string;

  @IsString()
  @IsOptional()
  visaNumber?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsUUID()
  @IsOptional()
  visaAgentId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
