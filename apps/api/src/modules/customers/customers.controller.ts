import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('customers')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'sales', 'operations', 'accounts')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(tenantId, createCustomerDto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('search') search?: string) {
    return this.customersService.findAll(tenantId, search);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customersService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(tenantId, id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles('agency_owner', 'manager')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customersService.remove(tenantId, id);
  }
}
