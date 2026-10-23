import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SupplierBookingsService } from './supplier-bookings.service';
import { CreateSupplierBookingDto } from './dto/create-supplier-booking.dto';
import { UpdateSupplierBookingDto } from './dto/update-supplier-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('supplier-bookings')
@UseGuards(JwtAuthGuard)
export class SupplierBookingsController {
  constructor(private readonly supplierBookingsService: SupplierBookingsService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() createDto: CreateSupplierBookingDto) {
    return this.supplierBookingsService.create(tenantId, createDto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('bookingId') bookingId: string,
  ) {
    return this.supplierBookingsService.findAllByBooking(tenantId, bookingId);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateSupplierBookingDto,
  ) {
    return this.supplierBookingsService.update(tenantId, id, updateDto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.supplierBookingsService.remove(tenantId, id);
  }
}
