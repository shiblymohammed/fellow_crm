import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { ExpenseCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsDateString()
  expenseDate: string;
}
