import { Controller, Get, Post, Body, UseGuards, Query, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() createDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(tenantId, req.user.id, createDto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('bookingId') bookingId: string,
  ) {
    return this.paymentsService.findAllByBooking(tenantId, bookingId);
  }

  @Get('schedules')
  findSchedules(
    @TenantId() tenantId: string,
    @Query('bookingId') bookingId: string,
  ) {
    return this.paymentsService.findSchedulesByBooking(tenantId, bookingId);
  }
}
