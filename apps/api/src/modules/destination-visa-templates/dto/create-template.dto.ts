import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class CreateDestinationVisaTemplateDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklistItems: ChecklistItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
