import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReport(tenantId: string, query: { startDate?: string, endDate?: string, salespersonId?: string, destination?: string }) {
    const { startDate, endDate, salespersonId, destination } = query;
    
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Base Lead Query
    const leadWhere: Prisma.LeadWhereInput = {
      tenantId,
      createdAt: { gte: start, lte: end },
    };
    if (salespersonId) leadWhere.assignedTo = salespersonId;
    if (destination) leadWhere.destination = { contains: destination, mode: 'insensitive' };

    // Base Booking Query
    const bookingWhere: Prisma.BookingWhereInput = {
      tenantId,
      createdAt: { gte: start, lte: end },
    };
    if (destination) bookingWhere.destination = { contains: destination, mode: 'insensitive' };

    // Base Payment Query
    const paymentWhere: Prisma.PaymentWhereInput = {
      tenantId,
      paidAt: { gte: start, lte: end },
    };

    // Parallel aggregations
    const [
      totalLeads,
      wonLeads,
      lostLeads,
      totalBookings,
      revenueAgg,
      paymentsAgg,
      leadsList,
      bookingsList,
      paymentsList
    ] = await Promise.all([
      this.prisma.lead.count({ where: leadWhere }),
      this.prisma.lead.count({ where: { ...leadWhere, status: 'won' } }),
      this.prisma.lead.count({ where: { ...leadWhere, status: 'lost' } }),
      this.prisma.booking.count({ where: bookingWhere }),
      
      this.prisma.booking.aggregate({
        where: bookingWhere,
        _sum: { totalAmount: true }
      }),

      this.prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true }
      }),

      // Detailed Lists for Tables / Export
      this.prisma.lead.findMany({
        where: leadWhere,
        include: { customer: true, assignedUser: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),

      this.prisma.booking.findMany({
        where: bookingWhere,
        include: { customer: true },
        orderBy: { createdAt: 'desc' }
      }),
      
      this.prisma.payment.findMany({
        where: paymentWhere,
        include: { booking: { include: { customer: true } } },
        orderBy: { paidAt: 'desc' }
      })
    ]);

    const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;
    const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);
    const totalCollected = Number(paymentsAgg._sum.amount || 0);

    return {
      summary: {
        totalLeads,
        wonLeads,
        lostLeads,
        conversionRate,
        totalBookings,
        totalRevenue,
        totalCollected
      },
      data: {
        leads: leadsList,
        bookings: bookingsList,
        payments: paymentsList
      }
    };
  }
}
