import { IsString, IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTravellerDto {
  @ApiProperty({ description: 'Booking ID' })
  @IsUUID()
  bookingId: string;

  @ApiPropertyOptional({ description: 'Customer ID (if this traveller is a customer)' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'Full name of the traveller' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Gender', enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({ description: 'Traveller type', enum: ['adult', 'child', 'infant'] })
  @IsEnum(['adult', 'child', 'infant'])
  type: 'adult' | 'child' | 'infant';

  @ApiPropertyOptional({ description: 'Passport number' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({ description: 'Passport expiry date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  passportExpiry?: string;

  @ApiPropertyOptional({ description: 'Place of birth' })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @ApiPropertyOptional({ description: 'Nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;
}
