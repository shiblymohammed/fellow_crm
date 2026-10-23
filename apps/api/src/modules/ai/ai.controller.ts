import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('ai')
@UseGuards(RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-itinerary')
  async generateItinerary(
    @TenantId() tenantId: string,
    @Body('preferences') preferences: string,
    @Body('packageId') packageId?: string
  ) {
    return this.aiService.generateItinerary(tenantId, preferences, packageId);
  }

  @Post('smart-query')
  async smartQuery(
    @TenantId() tenantId: string,
    @Body('prompt') prompt: string
  ) {
    return this.aiService.smartQuery(tenantId, prompt);
  }
}
