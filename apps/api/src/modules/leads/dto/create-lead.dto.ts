import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { LeadSource, LeadStatus } from '@prisma/client';

export class CreateLeadDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  // If customerId is not provided, we need customer info to auto-create
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsNumber()
  adults?: number;

  @IsOptional()
  @IsNumber()
  children?: number;

  @IsOptional()
  @IsNumber()
  infants?: number;

  @IsOptional()
  @IsNumber()
  budgetPerPerson?: number;

  @IsOptional()
  @IsString()
  preferredHotels?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsEnum(LeadSource)
  source: LeadSource;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
