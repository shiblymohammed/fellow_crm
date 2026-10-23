import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { ItineraryTemplatesService } from './itinerary-templates.service';
import { UpsertItineraryTemplateDto } from './dto/upsert-itinerary-template.dto';

@ApiTags('Itinerary Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packages/:packageId/itinerary-template')
export class ItineraryTemplatesController {
  constructor(private readonly templatesService: ItineraryTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get the itinerary template for a package' })
  async getTemplate(@TenantId() tenantId: string, @Param('packageId') packageId: string) {
    const template = await this.templatesService.getTemplate(tenantId, packageId);
    return template || {};
  }

  @Post()
  @ApiOperation({ summary: 'Create or update the itinerary template for a package' })
  async upsertTemplate(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('packageId') packageId: string,
    @Body() dto: UpsertItineraryTemplateDto,
  ) {
    return this.templatesService.upsertTemplate(tenantId, packageId, req.user.id, dto);
  }
}
