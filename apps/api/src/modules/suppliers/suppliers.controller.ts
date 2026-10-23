import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseBoolPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('suppliers')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'operations', 'accounts')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(tenantId, createSupplierDto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('destination') destination?: string,
    @Query('serviceType') serviceType?: string,
    @Query('isActive') isActiveStr?: string,
  ) {
    let isActive: boolean | undefined = undefined;
    if (isActiveStr !== undefined) {
      isActive = isActiveStr === 'true';
    }
    return this.suppliersService.findAll(tenantId, destination, serviceType, isActive);
  }

  @Get(':id')
  findOne(
    @TenantId() tenantId: string, 
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
  ) {
    return this.suppliersService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(tenantId, id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles('agency_owner', 'manager')
  remove(
    @TenantId() tenantId: string, 
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
  ) {
    return this.suppliersService.remove(tenantId, id);
  }
}
