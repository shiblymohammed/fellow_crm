import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateTravellerDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  travellerId: string;

  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  docType: DocumentType;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsUUID()
  @IsOptional()
  uploadedBy?: string;
}
