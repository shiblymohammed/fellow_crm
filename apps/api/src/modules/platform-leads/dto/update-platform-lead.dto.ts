import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformLeadDto } from './create-platform-lead.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum PlatformLeadStatus {
  new = 'new',
  contacted = 'contacted',
  demo_scheduled = 'demo_scheduled',
  closed_won = 'closed_won',
  closed_lost = 'closed_lost',
}

export class UpdatePlatformLeadDto extends PartialType(CreatePlatformLeadDto) {
  @IsOptional()
  @IsEnum(PlatformLeadStatus)
  status?: PlatformLeadStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
