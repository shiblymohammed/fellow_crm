import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierBookingDto } from './create-supplier-booking.dto';

export class UpdateSupplierBookingDto extends PartialType(CreateSupplierBookingDto) {}
