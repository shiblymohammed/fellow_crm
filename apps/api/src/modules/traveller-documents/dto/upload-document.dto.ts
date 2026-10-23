import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  travellerId: string;

  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  docType: DocumentType;
}
