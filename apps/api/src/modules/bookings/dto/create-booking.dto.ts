import { IsString, IsOptional, IsInt, IsDecimal, IsDateString, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsUUID()
  quotationId?: string;

  @IsUUID()
  customerId: string;

  @IsString()
  destination: string;

  @IsDateString()
  travelDate: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsInt()
  @Min(0)
  adults: number = 1;

  @IsInt()
  @Min(0)
  children: number = 0;

  @IsInt()
  @Min(0)
  infants: number = 0;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsDecimal()
  totalAmount: number;

  @IsOptional()
  @IsUUID()
  assignedSales?: string;

  @IsOptional()
  @IsUUID()
  assignedOps?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
