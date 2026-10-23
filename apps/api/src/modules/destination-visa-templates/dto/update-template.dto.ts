import { IsBoolean, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistItemDto {
  @IsString()
  itemName: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class UpdateDestinationVisaTemplateDto {
  @IsString()
  @IsOptional()
  destination?: string;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  @IsOptional()
  checklistItems?: ChecklistItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
