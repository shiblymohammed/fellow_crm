import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { VisaStatus } from '@prisma/client';

export class CreateVisaApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsUUID()
  @IsNotEmpty()
  travellerId: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

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
  expiryDate?: string;

  @IsUUID()
  @IsOptional()
  visaAgentId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
