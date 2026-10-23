import { IsString, IsInt, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageCategory, MarkupType } from '@prisma/client';

export class CreatePackageItemDto {
  @IsEnum(PackageCategory)
  category: PackageCategory;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  supplierCost: number;

  @IsEnum(MarkupType)
  markupType: MarkupType;

  @IsNumber()
  @Min(0)
  markupValue: number;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  destination: string;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsInt()
  @Min(0)
  durationNights: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePackageItemDto)
  items: CreatePackageItemDto[];
}
