import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ItineraryGeneratedBy } from '@prisma/client';

export class ItineraryActivityDto {
  @IsString()
  time: string;

  @IsString()
  icon: string;

  @IsString()
  description: string;
}

export class ItineraryDayDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNumber()
  dayNumber: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryActivityDto)
  activities: ItineraryActivityDto[];
}

export class UpsertItineraryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  publicSlug?: string;

  @IsEnum(ItineraryGeneratedBy)
  @IsOptional()
  generatedBy?: ItineraryGeneratedBy;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDayDto)
  days: ItineraryDayDto[];
}

export class CloneTemplateDto {
  @IsString()
  templateId: string;
}
