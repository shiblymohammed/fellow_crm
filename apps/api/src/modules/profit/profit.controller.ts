import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProfitService } from './profit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('profit')
@UseGuards(JwtAuthGuard)
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Get('summary')
  getSummary(
    @TenantId() tenantId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('destination') destination?: string,
  ) {
    return this.profitService.getPnLSummary(tenantId, { fromDate, toDate, destination });
  }

  @Get('bookings')
  getBookingsPnL(
    @TenantId() tenantId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.profitService.getBookingsPnL(tenantId, { fromDate, toDate });
  }

  @Get('bookings/:bookingId')
  getBookingPnL(
    @TenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.profitService.getBookingPnL(tenantId, bookingId);
  }
}
