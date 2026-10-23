import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('packages')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'sales', 'operations')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  create(@TenantId() tenantId: string, @Request() req: any, @Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(tenantId, req.user.id, createPackageDto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query('search') search?: string) {
    return this.packagesService.findAll(tenantId, search);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.packagesService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(tenantId, id, updatePackageDto);
  }

  @Delete(':id')
  @Roles('agency_owner', 'manager')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.packagesService.remove(tenantId, id);
  }
}
