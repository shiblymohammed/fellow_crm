import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DocumentStatus } from '@prisma/client';
import { CreateTravellerDocumentDto } from './create-traveller-document.dto';

export class UpdateTravellerDocumentDto extends PartialType(CreateTravellerDocumentDto) {
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @IsString()
  @IsOptional()
  rejectionNote?: string;

  @IsUUID()
  @IsOptional()
  verifiedBy?: string;
}
