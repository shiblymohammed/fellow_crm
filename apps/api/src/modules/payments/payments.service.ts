import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { StaffNotificationService } from '../notifications/staff-notification.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private readonly staffNotifications: StaffNotificationService,
  ) {}

  async create(tenantId: string, userId: string, createDto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify booking
      const booking = await tx.booking.findFirst({
        where: { id: createDto.bookingId, tenantId },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // 2. Create the payment
      const payment = await tx.payment.create({
        data: {
          tenantId,
          bookingId: createDto.bookingId,
          customerId: createDto.customerId,
          amount: createDto.amount,
          paymentType: createDto.paymentType,
          paymentMethod: createDto.paymentMethod,
          reference: createDto.reference,
          paidAt: new Date(createDto.paidAt),
          notes: createDto.notes,
          recordedBy: userId,
          paymentScheduleId: createDto.paymentScheduleId,
        },
      });

      // 3. Update the booking balance and amountPaid
      const newBalance = Number(booking.balance) - Number(createDto.amount);
      const newAmountPaid = Number(booking.amountPaid || 0) + Number(createDto.amount);
      
      await tx.booking.update({
        where: { id: booking.id },
        data: { 
          balance: newBalance < 0 ? 0 : newBalance,
          amountPaid: newAmountPaid
        },
      });

      // 4. Update the schedule if provided
      if (createDto.paymentScheduleId) {
        const schedule = await tx.paymentSchedule.findFirst({
          where: { id: createDto.paymentScheduleId, tenantId },
        });

        if (schedule) {
          const newAmountPaid = Number(schedule.amountPaid) + Number(createDto.amount);
          let newStatus = schedule.status;

          if (newAmountPaid >= Number(schedule.amountDue)) {
            newStatus = 'paid';
          } else if (newAmountPaid > 0) {
            newStatus = 'partially_paid';
          }

          await tx.paymentSchedule.update({
            where: { id: schedule.id },
            data: {
              amountPaid: newAmountPaid,
              status: newStatus,
            },
          });
        }
      }

      // 5. Notify staff of payment received (fire-and-forget)
      const customer = await this.prisma.customer.findUnique({
        where: { id: createDto.customerId },
        select: { name: true },
      });
      this.staffNotifications.notifyPaymentReceived(
        tenantId,
        createDto.bookingId,
        Number(createDto.amount),
        customer?.name || 'Unknown',
      ).catch(() => null);

      return payment;
    });
  }

  async findAllByBooking(tenantId: string, bookingId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId, bookingId },
      include: {
        recordedByUser: { select: { name: true } },
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  async findSchedulesByBooking(tenantId: string, bookingId: string) {
    return this.prisma.paymentSchedule.findMany({
      where: { tenantId, bookingId },
      orderBy: { dueDate: 'asc' },
    });
  }
}
