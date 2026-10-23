import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('quotations')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'sales', 'operations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  create(@TenantId() tenantId: string, @Request() req: any, @Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(tenantId, req.user.id, createQuotationDto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.quotationsService.findAll(tenantId, status, search);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.quotationsService.findOne(tenantId, id);
  }

  // SECURITY FIX: Removed public endpoint that leaked cross-tenant data
  // Old endpoint: @Public() @Get('public/:id')
  // If public access is needed, implement with secure access tokens:
  // @Get('share/:slug/:token') where token is validated and time-limited

  @Patch(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
    return this.quotationsService.update(tenantId, id, updateQuotationDto);
  }

  @Get(':id/pdf')
  async getPdf(@TenantId() tenantId: string, @Param('id') id: string) {
    const pdfUrl = await this.quotationsService.getPdf(tenantId, id);
    return { url: pdfUrl };
  }

  @Post(':id/generate-pdf')
  async generatePdf(@TenantId() tenantId: string, @Param('id') id: string) {
    // Force regenerate PDF by clearing the existing one first
    const quotation = await this.quotationsService.findOne(tenantId, id);
    if (quotation.pdfUrl) {
      await this.quotationsService.update(tenantId, id, { pdfUrl: null } as any);
    }
    const pdfUrl = await this.quotationsService.getPdf(tenantId, id);
    return { url: pdfUrl, message: 'PDF generated successfully' };
  }

  @Delete(':id')
  @Roles('agency_owner', 'manager')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.quotationsService.remove(tenantId, id);
  }
}
