import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TenantBillingService } from './tenant-billing.service';
import { CreateTenantBillingDto } from './dto/create-tenant-billing.dto';
import { UpdateTenantBillingDto } from './dto/update-tenant-billing.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('tenant-billing')
@UseGuards(RolesGuard)
export class TenantBillingController {
  constructor(private readonly tenantBillingService: TenantBillingService) {}

  @Post()
  @Roles('super_admin')
  create(@Body() createTenantBillingDto: CreateTenantBillingDto) {
    return this.tenantBillingService.create(createTenantBillingDto);
  }

  @Get('tenant/:tenantId')
  @Roles('super_admin')
  findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.tenantBillingService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles('super_admin')
  findOne(@Param('id') id: string) {
    return this.tenantBillingService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  update(@Param('id') id: string, @Body() updateTenantBillingDto: UpdateTenantBillingDto) {
    return this.tenantBillingService.update(id, updateTenantBillingDto);
  }

  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id') id: string) {
    return this.tenantBillingService.remove(id);
  }
}
