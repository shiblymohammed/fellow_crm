import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierBookingDto } from './dto/create-supplier-booking.dto';
import { UpdateSupplierBookingDto } from './dto/update-supplier-booking.dto';

@Injectable()
export class SupplierBookingsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createDto: CreateSupplierBookingDto) {
    return this.prisma.supplierBooking.create({
      data: {
        ...createDto,
        tenantId,
      },
      include: {
        supplier: {
          select: { companyName: true, contactPerson: true, phone: true }
        }
      }
    });
  }

  async findAllByBooking(tenantId: string, bookingId: string) {
    return this.prisma.supplierBooking.findMany({
      where: {
        tenantId,
        bookingId,
      },
      include: {
        supplier: {
          select: { companyName: true, contactPerson: true, phone: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, updateDto: UpdateSupplierBookingDto) {
    const existing = await this.prisma.supplierBooking.findUnique({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`SupplierBooking with ID ${id} not found`);
    }

    return this.prisma.supplierBooking.update({
      where: { id },
      data: updateDto,
      include: {
        supplier: {
          select: { companyName: true, contactPerson: true, phone: true }
        }
      }
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.supplierBooking.findUnique({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`SupplierBooking with ID ${id} not found`);
    }

    return this.prisma.supplierBooking.delete({
      where: { id },
    });
  }
}
