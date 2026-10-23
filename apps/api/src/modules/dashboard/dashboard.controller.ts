import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('dashboard')
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('super-admin')
  @Roles('super_admin')
  getSuperAdminDashboard() {
    return this.dashboardService.getSuperAdminDashboard();
  }

  @Get('agency')
  @Roles('agency_owner', 'manager', 'sales', 'operations', 'accounts')
  getAgencyDashboard(@TenantId() tenantId: string) {
    return this.dashboardService.getAgencyDashboard(tenantId);
  }

  @Get('search')
  @Roles('agency_owner', 'manager', 'sales', 'operations', 'accounts')
  globalSearch(@TenantId() tenantId: string, @Query('q') query: string) {
    if (!query || query.trim() === '') return { data: [] };
    return this.dashboardService.globalSearch(tenantId, query);
  }
}
