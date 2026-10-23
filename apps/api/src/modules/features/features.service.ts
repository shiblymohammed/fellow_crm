import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@Injectable()
export class FeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    const overrides = await this.prisma.tenantFeature.findMany({
      where: { tenantId },
    });

    const result = new Map<string, boolean>();
    
    // 1. Add plan defaults
    if (tenant?.plan?.features) {
      tenant.plan.features.forEach(f => result.set(f, true));
    }
    
    // 2. Apply explicit overrides
    overrides.forEach(o => result.set(o.featureKey, o.isEnabled));
    
    return Array.from(result.entries()).map(([featureKey, isEnabled]) => ({
      featureKey,
      isEnabled,
    }));
  }

  async updateFeature(tenantId: string, updateFeatureDto: UpdateFeatureDto) {
    return this.prisma.tenantFeature.upsert({
      where: {
        tenantId_featureKey: {
          tenantId,
          featureKey: updateFeatureDto.featureKey,
        },
      },
      update: {
        isEnabled: updateFeatureDto.isEnabled,
      },
      create: {
        tenantId,
        featureKey: updateFeatureDto.featureKey,
        isEnabled: updateFeatureDto.isEnabled,
      },
    });
  }
}
