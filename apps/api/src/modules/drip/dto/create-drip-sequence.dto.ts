import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { DripTrigger } from '@prisma/client';

export class CreateDripSequenceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DripTrigger)
  triggerStage: DripTrigger;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
