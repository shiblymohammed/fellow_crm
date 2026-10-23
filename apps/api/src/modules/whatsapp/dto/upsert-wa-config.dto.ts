import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { BspProvider } from '@prisma/client';

export class UpsertWaConfigDto {
  @IsString()
  @IsNotEmpty()
  waPhoneNumberId: string;

  @IsString()
  @IsNotEmpty()
  waAccessToken: string;

  @IsOptional()
  @IsString()
  waBusinessAccountId?: string;

  @IsEnum(BspProvider)
  bspProvider: BspProvider;

  @IsOptional()
  @IsString()
  bspApiKey?: string;
}
