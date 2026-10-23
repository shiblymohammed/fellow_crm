import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: {
          ...createCustomerDto,
          tenantId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        const field = target.includes('phone') ? 'phone number' : 'email';
        throw new ConflictException(`A customer with this ${field} already exists.`);
      }
      throw error;
    }
  }

  async findAll(tenantId: string, search?: string) {
    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { leads: true, bookings: true },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        leads: { orderBy: { createdAt: 'desc' }, take: 10 },
        bookings: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { leads: true, bookings: true, payments: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(tenantId: string, id: string, updateCustomerDto: UpdateCustomerDto) {
    // Ensure customer belongs to tenant
    const existing = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Customer not found');

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Customer not found');

    return this.prisma.customer.delete({ where: { id } });
  }
}
