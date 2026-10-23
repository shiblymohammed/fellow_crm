import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LeadNotesService } from './lead-notes.service';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('lead-notes')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'sales', 'operations')
export class LeadNotesController {
  constructor(private readonly leadNotesService: LeadNotesService) {}

  @Post()
  create(@TenantId() tenantId: string, @Request() req: any, @Body() createLeadNoteDto: CreateLeadNoteDto) {
    return this.leadNotesService.create(tenantId, req.user.id, createLeadNoteDto);
  }

  @Get('lead/:leadId')
  findAllByLead(@TenantId() tenantId: string, @Param('leadId') leadId: string) {
    return this.leadNotesService.findAllByLead(tenantId, leadId);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Request() req: any, @Param('id') id: string) {
    return this.leadNotesService.remove(tenantId, id, req.user.id, req.user.role);
  }
}
