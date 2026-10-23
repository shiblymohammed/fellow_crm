import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsUUID, IsDefined, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ItineraryActivityDto {
  @ApiProperty()
  @IsString()
  time: string;

  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class UpsertItineraryTemplateDayDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsInt()
  dayNumber: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [ItineraryActivityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryActivityDto)
  activities: ItineraryActivityDto[];
}

export class UpsertItineraryTemplateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ type: [UpsertItineraryTemplateDayDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertItineraryTemplateDayDto)
  days: UpsertItineraryTemplateDayDto[];
}
