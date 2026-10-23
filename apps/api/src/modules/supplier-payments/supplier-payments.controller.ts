import { Controller, Get, Post, Body, UseGuards, Query, Request } from '@nestjs/common';
import { SupplierPaymentsService } from './supplier-payments.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('supplier-payments')
@UseGuards(JwtAuthGuard)
export class SupplierPaymentsController {
  constructor(private readonly supplierPaymentsService: SupplierPaymentsService) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() createDto: CreateSupplierPaymentDto,
  ) {
    return this.supplierPaymentsService.create(tenantId, req.user.id, createDto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('supplierId') supplierId?: string,
    @Query('bookingId') bookingId?: string,
  ) {
    if (supplierId) {
      return this.supplierPaymentsService.findAllBySupplier(tenantId, supplierId);
    } else if (bookingId) {
      return this.supplierPaymentsService.findAllByBooking(tenantId, bookingId);
    }
    return [];
  }
}
