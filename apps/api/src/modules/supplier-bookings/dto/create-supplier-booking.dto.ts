import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { PackageCategory, SupplierBookingStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateSupplierBookingDto {
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsEnum(PackageCategory)
  serviceType: PackageCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsEnum(SupplierBookingStatus)
  status?: SupplierBookingStatus;

  @IsOptional()
  @IsString()
  confirmationRef?: string;
}
