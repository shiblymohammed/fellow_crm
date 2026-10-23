import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('bookings')
@UseGuards(RolesGuard)
@Roles('agency_owner', 'manager', 'sales', 'operations', 'accounts')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(tenantId, req.user.id, createBookingDto);
  }

  @Post('from-quotation/:quotationId')
  createFromQuotation(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('quotationId') quotationId: string,
  ) {
    return this.bookingsService.createFromQuotation(tenantId, req.user.id, quotationId);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.bookingsService.findAll(tenantId, status, search);
  }

  @Get(':id')
  findOne(
    @TenantId() tenantId: string, 
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
  ) {
    return this.bookingsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(tenantId, id, updateBookingDto);
  }

  @Delete(':id')
  @Roles('agency_owner', 'manager')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookingsService.remove(tenantId, id);
  }

  @Post(':id/generate-visas')
  @Roles('agency_owner', 'manager', 'operations')
  generateVisas(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.bookingsService.autoGenerateVisaApplications(tenantId, id);
  }
}
