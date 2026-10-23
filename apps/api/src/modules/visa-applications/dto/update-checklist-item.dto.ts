import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { VisaChecklistStatus } from '@prisma/client';

export class UpdateChecklistItemDto {
  @IsString()
  @IsOptional()
  itemName?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsEnum(VisaChecklistStatus)
  @IsOptional()
  status?: VisaChecklistStatus;
}
