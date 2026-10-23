import { PartialType } from '@nestjs/swagger';
import { CreateTravellerDto } from './create-traveller.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateTravellerDto extends PartialType(
  OmitType(CreateTravellerDto, ['bookingId'] as const),
) {}
