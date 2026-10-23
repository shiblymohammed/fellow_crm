import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { PaymentMethod, SupplierPaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateSupplierPaymentDto {
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsEnum(SupplierPaymentStatus)
  status?: SupplierPaymentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
