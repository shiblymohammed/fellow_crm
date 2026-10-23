import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { VisaChecklistStatus } from '@prisma/client';

export class CreateChecklistItemDto {
  @IsUUID()
  @IsNotEmpty()
  visaId: string;

  @IsUUID()
  @IsNotEmpty()
  travellerId: string;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsEnum(VisaChecklistStatus)
  @IsOptional()
  status?: VisaChecklistStatus;
}
