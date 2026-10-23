import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { TravellersModule } from '../travellers/travellers.module';
import { VisaApplicationsModule } from '../visa-applications/visa-applications.module';

@Module({
  imports: [TravellersModule, VisaApplicationsModule],
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService],
  exports: [BookingsService],
})
export class BookingsModule {}
