import { IsBoolean, IsString } from 'class-validator';

export class UpdateFeatureDto {
  @IsBoolean()
  isEnabled: boolean;

  @IsString()
  featureKey: string;
}
