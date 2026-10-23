import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createDto: CreateExpenseDto, receiptUrl?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: createDto.bookingId, tenantId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.expense.create({
      data: {
        tenantId,
        bookingId: createDto.bookingId,
        category: createDto.category,
        description: createDto.description,
        amount: createDto.amount,
        expenseDate: new Date(createDto.expenseDate),
        receiptUrl,
        recordedBy: userId,
      },
    });
  }

  async findAllByBooking(tenantId: string, bookingId: string) {
    return this.prisma.expense.findMany({
      where: { tenantId, bookingId },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.expense.delete({
      where: { id, tenantId },
    });
  }
}
