import { IsString, IsEnum, IsUUID } from 'class-validator';
import { LeadNoteType } from '@prisma/client';

export class CreateLeadNoteDto {
  @IsUUID()
  leadId: string;

  @IsEnum(LeadNoteType)
  type: LeadNoteType;

  @IsString()
  content: string;
}
