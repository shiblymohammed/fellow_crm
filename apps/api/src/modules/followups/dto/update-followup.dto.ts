import { PartialType } from '@nestjs/swagger';
import { CreateFollowupDto } from './create-followup.dto';

export class UpdateFollowupDto extends PartialType(CreateFollowupDto) {}
