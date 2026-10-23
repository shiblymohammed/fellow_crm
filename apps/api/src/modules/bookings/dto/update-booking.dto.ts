import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  DOCUMENTS_PENDING = 'documents_pending',
  VISA_PROCESSING = 'visa_processing',
  READY = 'ready',
  TRAVELLING = 'travelling',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  cancelledAt?: string;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}
