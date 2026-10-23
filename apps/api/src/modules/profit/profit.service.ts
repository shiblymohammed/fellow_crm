import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface BookingPnL {
  bookingId: string;
  bookingNumber: string;
  destination: string;
  travelDate: Date;
  customerName: string;
  revenue: number;
  supplierCost: number;
  expenses: number;
  grossProfit: number;
  marginPercent: number;
  status: string;
}

export interface PnLSummary {
  totalRevenue: number;
  totalSupplierCost: number;
  totalExpenses: number;
  totalGrossProfit: number;
  avgMarginPercent: number;
  bookingCount: number;
  byDestination: { destination: string; revenue: number; profit: number; bookingCount: number }[];
  byMonth: { month: string; revenue: number; profit: number; bookingCount: number }[];
}

@Injectable()
export class ProfitService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookingPnL(tenantId: string, bookingId: string): Promise<BookingPnL> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, status: { not: 'cancelled' } },
      include: {
        customer: { select: { name: true } },
        supplierBookings: { select: { amount: true, status: true } },
        expenses: { select: { amount: true } },
      },
    });

    if (!booking) throw new Error('Booking not found');

    const revenue = Number(booking.totalAmount);
    const supplierCost = booking.supplierBookings
      .filter(sb => sb.status !== 'cancelled')
      .reduce((sum, sb) => sum + Number(sb.amount), 0);
    const expenses = booking.expenses
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const grossProfit = revenue - supplierCost - expenses;
    const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      destination: booking.destination,
      travelDate: booking.travelDate,
      customerName: booking.customer.name,
      revenue,
      supplierCost,
      expenses,
      grossProfit,
      marginPercent: Math.round(marginPercent * 100) / 100,
      status: booking.status,
    };
  }

  async getPnLSummary(
    tenantId: string,
    options?: { fromDate?: string; toDate?: string; destination?: string }
  ): Promise<PnLSummary> {
    const where: any = { tenantId, status: { not: 'cancelled' } };
    if (options?.fromDate || options?.toDate) {
      where.travelDate = {};
      if (options.fromDate) where.travelDate.gte = new Date(options.fromDate);
      if (options.toDate) where.travelDate.lte = new Date(options.toDate);
    }
    if (options?.destination) {
      where.destination = { contains: options.destination, mode: 'insensitive' };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        supplierBookings: { select: { amount: true, status: true } },
        expenses: { select: { amount: true } },
      },
      orderBy: { travelDate: 'desc' },
    });

    let totalRevenue = 0;
    let totalSupplierCost = 0;
    let totalExpenses = 0;
    const destinationMap = new Map<string, { revenue: number; profit: number; count: number }>();
    const monthMap = new Map<string, { revenue: number; profit: number; count: number }>();

    for (const booking of bookings) {
      const revenue = Number(booking.totalAmount);
      const supplierCost = booking.supplierBookings
        .filter(sb => sb.status !== 'cancelled')
        .reduce((sum, sb) => sum + Number(sb.amount), 0);
      const expenses = booking.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const profit = revenue - supplierCost - expenses;

      totalRevenue += revenue;
      totalSupplierCost += supplierCost;
      totalExpenses += expenses;

      // By destination
      const dest = booking.destination;
      const destEntry = destinationMap.get(dest) || { revenue: 0, profit: 0, count: 0 };
      destinationMap.set(dest, { revenue: destEntry.revenue + revenue, profit: destEntry.profit + profit, count: destEntry.count + 1 });

      // By month
      const month = booking.travelDate.toISOString().slice(0, 7); // "YYYY-MM"
      const monthEntry = monthMap.get(month) || { revenue: 0, profit: 0, count: 0 };
      monthMap.set(month, { revenue: monthEntry.revenue + revenue, profit: monthEntry.profit + profit, count: monthEntry.count + 1 });
    }

    const totalGrossProfit = totalRevenue - totalSupplierCost - totalExpenses;
    const avgMarginPercent = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

    const byDestination = Array.from(destinationMap.entries())
      .map(([destination, val]) => ({ destination, revenue: val.revenue, profit: val.profit, bookingCount: val.count }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    const byMonth = Array.from(monthMap.entries())
      .map(([month, val]) => ({ month, revenue: val.revenue, profit: val.profit, bookingCount: val.count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalRevenue,
      totalSupplierCost,
      totalExpenses,
      totalGrossProfit,
      avgMarginPercent: Math.round(avgMarginPercent * 100) / 100,
      bookingCount: bookings.length,
      byDestination,
      byMonth,
    };
  }

  async getBookingsPnL(tenantId: string, options?: { fromDate?: string; toDate?: string }): Promise<BookingPnL[]> {
    const where: any = { tenantId, status: { not: 'cancelled' } };
    if (options?.fromDate || options?.toDate) {
      where.travelDate = {};
      if (options.fromDate) where.travelDate.gte = new Date(options.fromDate);
      if (options.toDate) where.travelDate.lte = new Date(options.toDate);
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        customer: { select: { name: true } },
        supplierBookings: { select: { amount: true, status: true } },
        expenses: { select: { amount: true } },
      },
      orderBy: { travelDate: 'desc' },
    });

    return bookings.map(booking => {
      const revenue = Number(booking.totalAmount);
      const supplierCost = booking.supplierBookings
        .filter(sb => sb.status !== 'cancelled')
        .reduce((sum, sb) => sum + Number(sb.amount), 0);
      const expenses = booking.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const grossProfit = revenue - supplierCost - expenses;
      const marginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

      return {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        destination: booking.destination,
        travelDate: booking.travelDate,
        customerName: booking.customer.name,
        revenue,
        supplierCost,
        expenses,
        grossProfit,
        marginPercent: Math.round(marginPercent * 100) / 100,
        status: booking.status,
      };
    });
  }
}
