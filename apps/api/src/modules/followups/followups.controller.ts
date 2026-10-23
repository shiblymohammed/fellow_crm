import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { UpdateFollowupDto } from './dto/update-followup.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('followups')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'sales', 'operations')
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Post()
  create(@TenantId() tenantId: string, @Request() req: any, @Body() createFollowupDto: CreateFollowupDto) {
    return this.followupsService.create(tenantId, req.user.id, createFollowupDto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('filter') filter?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.followupsService.findAll(tenantId, filter, assignedTo);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.followupsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() updateFollowupDto: UpdateFollowupDto) {
    return this.followupsService.update(tenantId, id, updateFollowupDto);
  }

  @Delete(':id')
  @Roles('agency_owner', 'manager')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.followupsService.remove(tenantId, id);
  }
}
