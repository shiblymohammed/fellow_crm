import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VisaApplicationsService } from './visa-applications.service';
import { CreateVisaApplicationDto } from './dto/create-visa-application.dto';
import { UpdateVisaApplicationDto } from './dto/update-visa-application.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { VisaStatus } from '@prisma/client';

@Controller('visa-applications')
@UseGuards(JwtAuthGuard)
export class VisaApplicationsController {
  constructor(private readonly visaApplicationsService: VisaApplicationsService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateVisaApplicationDto) {
    return this.visaApplicationsService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('bookingId') bookingId?: string,
    @Query('travellerId') travellerId?: string,
    @Query('status') status?: VisaStatus,
    @Query('destination') destination?: string,
  ) {
    return this.visaApplicationsService.findAll(tenantId, {
      bookingId,
      travellerId,
      status,
      destination,
    });
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.visaApplicationsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVisaApplicationDto,
  ) {
    return this.visaApplicationsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.visaApplicationsService.remove(tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: VisaStatus,
  ) {
    return this.visaApplicationsService.updateStatus(tenantId, id, status);
  }

  // Checklist item endpoints
  @Post('checklist-items')
  createChecklistItem(@TenantId() tenantId: string, @Body() dto: CreateChecklistItemDto) {
    return this.visaApplicationsService.createChecklistItem(tenantId, dto);
  }

  @Patch('checklist-items/:itemId')
  updateChecklistItem(
    @TenantId() tenantId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.visaApplicationsService.updateChecklistItem(tenantId, itemId, dto);
  }

  @Delete('checklist-items/:itemId')
  removeChecklistItem(@TenantId() tenantId: string, @Param('itemId') itemId: string) {
    return this.visaApplicationsService.removeChecklistItem(tenantId, itemId);
  }

  // Template-based creation
  @Post('from-template')
  createFromTemplate(
    @TenantId() tenantId: string,
    @Body('bookingId') bookingId: string,
    @Body('travellerId') travellerId: string,
    @Body('destination') destination: string,
  ) {
    return this.visaApplicationsService.createFromTemplate(
      tenantId,
      bookingId,
      travellerId,
      destination,
    );
  }

  @Get('templates/:destination')
  getTemplate(@TenantId() tenantId: string, @Param('destination') destination: string) {
    return this.visaApplicationsService.getDestinationTemplate(tenantId, destination);
  }
}
