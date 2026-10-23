import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('leads')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'sales', 'operations')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@TenantId() tenantId: string, @Request() req: any, @Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(tenantId, req.user.id, createLeadDto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('search') search?: string,
  ) {
    return this.leadsService.findAll(tenantId, status, assignedTo, search);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(tenantId, id, updateLeadDto);
  }

  @Delete(':id')
  @Roles('agency_owner', 'manager')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.leadsService.remove(tenantId, id);
  }
}
