import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { FollowupType } from '@prisma/client';

export class CreateFollowupDto {
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsDateString()
  dueAt: string;

  @IsEnum(FollowupType)
  type: FollowupType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
