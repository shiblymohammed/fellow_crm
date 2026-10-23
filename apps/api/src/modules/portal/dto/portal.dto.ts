import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({ description: 'The public slug of the itinerary/booking' })
  @IsString()
  @IsNotEmpty()
  publicSlug: string;

  @ApiProperty({ description: 'The phone number of the customer' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'The public slug of the itinerary/booking' })
  @IsString()
  @IsNotEmpty()
  publicSlug: string;

  @ApiProperty({ description: 'The phone number of the customer' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'The 6-digit OTP' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
