import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Res, BadRequestException } from '@nestjs/common';
import { MarketplaceTemplatesService } from './marketplace-templates.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('marketplace-templates')
@UseGuards(RolesGuard)
export class MarketplaceTemplatesController {
  constructor(private readonly service: MarketplaceTemplatesService) {}

  // ==========================================
  // SUPER ADMIN ROUTES
  // ==========================================

  @Post('admin')
  @Roles('super_admin')
  createTemplate(@Body() data: any) {
    return this.service.createTemplate(data);
  }

  @Put('admin/:id')
  @Roles('super_admin')
  updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.service.updateTemplate(id, data);
  }

  @Delete('admin/:id')
  @Roles('super_admin')
  deleteTemplate(@Param('id') id: string) {
    return this.service.deleteTemplate(id);
  }

  // ==========================================
  // AGENCY ROUTES
  // ==========================================

  @Get()
  getMarketplace(@TenantId() tenantId: string) {
    return this.service.getMarketplace(tenantId);
  }

  @Post(':id/install')
  installTemplate(@TenantId() tenantId: string, @Param('id') templateId: string) {
    return this.service.installTemplate(tenantId, templateId);
  }

  @Get('installed')
  getInstalledTemplates(@TenantId() tenantId: string, @Query('category') category: string) {
    return this.service.getInstalledTemplates(tenantId, category);
  }

  @Post('installed/:id/generate-pdf')
  async generatePdf(
    @TenantId() tenantId: string, 
    @Param('id') installedId: string, 
    @Body() payload: any,
    @Res() res: any
  ) {
    try {
      const buffer = await this.service.generatePdfFromTemplate(tenantId, installedId, payload);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="generated-template.pdf"',
        'Content-Length': buffer.length,
      });
      
      res.end(buffer);
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      throw new BadRequestException(error.message);
    }
  }
}
