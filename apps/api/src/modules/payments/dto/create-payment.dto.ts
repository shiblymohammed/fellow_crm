import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { PaymentMethod, PaymentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsOptional()
  @IsString()
  paymentScheduleId?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsDateString()
  paidAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
