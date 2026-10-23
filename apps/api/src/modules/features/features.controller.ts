import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('features')
@UseGuards(RolesGuard)
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get('tenant/:tenantId')
  @Roles('super_admin')
  findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.featuresService.findAllByTenant(tenantId);
  }

  @Patch('tenant/:tenantId')
  @Roles('super_admin')
  updateFeature(
    @Param('tenantId') tenantId: string,
    @Body() updateFeatureDto: UpdateFeatureDto,
  ) {
    return this.featuresService.updateFeature(tenantId, updateFeatureDto);
  }
}
