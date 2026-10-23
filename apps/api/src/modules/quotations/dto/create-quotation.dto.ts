import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsEnum, IsNumber, Min, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageCategory, QuotationStatus } from '@prisma/client';

export class CreateQuotationItemDto {
  @IsEnum(PackageCategory)
  category: PackageCategory;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  supplierCost: number;

  @IsNumber()
  @Min(0)
  customerPrice: number;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class CreateQuotationDto {
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsInt()
  @Min(1)
  adults: number;

  @IsInt()
  @Min(0)
  children: number;

  @IsInt()
  @Min(0)
  infants: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[];
}
