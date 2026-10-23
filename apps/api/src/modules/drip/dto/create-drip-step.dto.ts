import { IsString, IsNotEmpty, IsEnum, IsInt, IsPositive, Min } from 'class-validator';
import { DripStepType } from '@prisma/client';

export class CreateDripStepDto {
  @IsInt()
  @IsPositive()
  stepNumber: number;

  @IsInt()
  @Min(0)
  delayDays: number;

  @IsString()
  @IsNotEmpty()
  messageTemplate: string;

  @IsEnum(DripStepType)
  stepType: DripStepType;
}
