import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';

@Injectable()
export class SupplierPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createDto: CreateSupplierPaymentDto) {
    // Verify supplier
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: createDto.supplierId, tenantId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (createDto.bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: createDto.bookingId, tenantId },
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
    }

    return this.prisma.supplierPayment.create({
      data: {
        tenantId,
        supplierId: createDto.supplierId,
        bookingId: createDto.bookingId,
        amount: createDto.amount,
        paymentMethod: createDto.paymentMethod,
        reference: createDto.reference,
        paidAt: createDto.paidAt ? new Date(createDto.paidAt) : new Date(),
        status: createDto.status || 'paid',
        notes: createDto.notes,
        recordedBy: userId,
      },
    });
  }

  async findAllBySupplier(tenantId: string, supplierId: string) {
    return this.prisma.supplierPayment.findMany({
      where: { tenantId, supplierId },
      orderBy: { paidAt: 'desc' },
    });
  }

  async findAllByBooking(tenantId: string, bookingId: string) {
    return this.prisma.supplierPayment.findMany({
      where: { tenantId, bookingId },
      include: {
        supplier: { select: { companyName: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
  }
}
