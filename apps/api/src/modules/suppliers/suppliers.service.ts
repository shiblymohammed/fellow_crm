import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        ...createSupplierDto,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    destination?: string,
    serviceType?: string,
    isActive?: boolean,
  ) {
    const where: Prisma.SupplierWhereInput = {
      tenantId,
    };

    if (destination) {
      where.destination = { contains: destination, mode: 'insensitive' };
    }

    if (serviceType) {
      where.services = { has: serviceType };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const suppliers = await this.prisma.supplier.findMany({
      where,
      include: {
        supplierBookings: {
          select: {
            amount: true,
          }
        },
        supplierPayments: {
          where: {
            status: 'paid',
          },
          select: {
            amount: true,
          }
        },
      },
      orderBy: { companyName: 'asc' },
    });

    // Compute outstanding payable
    return suppliers.map(supplier => {
      const totalBooked = supplier.supplierBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);
      const totalPaid = supplier.supplierPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      
      const { supplierBookings, supplierPayments, ...rest } = supplier;
      
      return {
        ...rest,
        outstandingPayable: totalBooked - totalPaid,
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id, tenantId },
      include: {
        supplierBookings: {
          select: {
            amount: true,
          }
        },
        supplierPayments: {
          where: {
            status: 'paid',
          },
          select: {
            amount: true,
          }
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    const totalBooked = supplier.supplierBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const totalPaid = supplier.supplierPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    
    const { supplierBookings, supplierPayments, ...rest } = supplier;

    return {
      ...rest,
      outstandingPayable: totalBooked - totalPaid,
    };
  }

  async update(tenantId: string, id: string, updateSupplierDto: UpdateSupplierDto) {
    // Check if exists
    await this.findOne(tenantId, id);

    return this.prisma.supplier.update({
      where: { id, tenantId },
      data: updateSupplierDto,
    });
  }

  async remove(tenantId: string, id: string) {
    // Check if exists
    await this.findOne(tenantId, id);

    return this.prisma.supplier.delete({
      where: { id, tenantId },
    });
  }
}
