import { Module } from '@nestjs/common';
import { SupplierBookingsService } from './supplier-bookings.service';
import { SupplierBookingsController } from './supplier-bookings.controller';

@Module({
  controllers: [SupplierBookingsController],
  providers: [SupplierBookingsService],
  exports: [SupplierBookingsService],
})
export class SupplierBookingsModule {}
