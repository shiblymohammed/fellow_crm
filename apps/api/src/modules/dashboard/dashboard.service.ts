import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuperAdminDashboard() {
    // Basic aggregation
    const [
      totalAgencies,
      activeAgencies,
      totalRevenueRecords,
      totalLeads,
      recentLeads
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'active' } }),
      this.prisma.tenantBilling.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
      }),
      this.prisma.platformLead.count(),
      this.prisma.platformLead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      })
    ]);

    // MRR calculation (Sum of active plans' price for active agencies on monthly cycles)
    const activeMonthlyTenants = await this.prisma.tenant.findMany({
      where: { status: 'active' },
      include: { plan: true }
    });

    let mrr = 0;
    activeMonthlyTenants.forEach(t => {
      if (t.plan?.price) {
        if (t.plan.billingCycle === 'monthly') mrr += Number(t.plan.price);
        if (t.plan.billingCycle === 'annual') mrr += Number(t.plan.price) / 12;
      }
    });

    return {
      totalAgencies,
      activeAgencies,
      totalRevenue: totalRevenueRecords._sum.amount || 0,
      totalLeads,
      mrr,
      recentLeads
    };
  }

  async getAgencyDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      // Sales
      totalLeads,
      activeLeads,
      newEnquiries,
      wonLeads,
      totalQuotations,
      todaysFollowUps,
      
      // Bookings
      upcomingTrips,
      confirmedBookings,
      pendingBookings,

      // Finance & Operations Prep
      bookingsAgg,
      todaysCollections,
      supplierPayables,
      visaPending,
      recentLeads,
      recentBookings,
      recentPaymentsForChart,
      todaysNotes
    ] = await Promise.all([
      // Sales
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.lead.count({ where: { tenantId, status: { in: ['new', 'contacted', 'interested', 'quotation_sent', 'negotiating'] } } }),
      this.prisma.lead.count({ where: { tenantId, status: 'new' } }),
      this.prisma.lead.count({ where: { tenantId, status: 'won' } }),
      this.prisma.quotation.count({ where: { tenantId } }),
      this.prisma.followup.count({ where: { tenantId, dueAt: { gte: today, lte: endOfToday }, status: 'pending' } }),
      
      // Bookings
      this.prisma.booking.count({ where: { tenantId, travelDate: { gt: today } } }),
      this.prisma.booking.count({ where: { tenantId, status: 'confirmed' } }),
      this.prisma.booking.count({ where: { tenantId, status: 'documents_pending' } }),

      // Finance (Balance & Profit)
      this.prisma.booking.aggregate({
        where: { tenantId, status: { not: 'cancelled' } },
        _sum: { balance: true }
      }),
      // Today's Collection
      this.prisma.payment.aggregate({
        where: { tenantId, paidAt: { gte: today, lte: endOfToday } },
        _sum: { amount: true }
      }),
      // Supplier Payable
      this.prisma.supplierBooking.aggregate({
        where: { tenantId, status: { not: 'cancelled' } },
        _sum: { amount: true }
      }),
      
      // Operations
      this.prisma.visaApplication.count({ where: { tenantId, status: 'submitted' } }),

      // Recent Data for UI
      this.prisma.lead.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, assignedUser: { select: { id: true, name: true } } },
      }),
      this.prisma.booking.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      // Last 6 months of payments for the chart
      this.prisma.payment.findMany({
        where: {
          tenantId,
          paidAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)) }
        },
        select: { amount: true, paidAt: true }
      }),
      // Today's Agent Activity (Lead Notes)
      this.prisma.leadNote.findMany({
        where: { tenantId, createdAt: { gte: today, lte: endOfToday } },
        include: { createdByUser: { select: { name: true } } }
      })
    ]);

    const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;
    
    // Process Agent Activity
    const activityMap: Record<string, { agentName: string, callCount: number, otherCount: number }> = {};
    todaysNotes.forEach(note => {
      const agentId = note.createdBy;
      if (!activityMap[agentId]) {
        activityMap[agentId] = { agentName: note.createdByUser.name, callCount: 0, otherCount: 0 };
      }
      if (note.type === 'call') {
        activityMap[agentId].callCount++;
      } else {
        activityMap[agentId].otherCount++;
      }
    });
    const agentActivity = Object.values(activityMap).sort((a, b) => b.callCount - a.callCount);

    // Group payments by month (e.g., 'Jan', 'Feb')
    const monthlyData: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      monthlyData[monthName] = 0;
    }

    recentPaymentsForChart.forEach(p => {
      const monthName = new Date(p.paidAt).toLocaleString('default', { month: 'short' });
      if (monthlyData[monthName] !== undefined) {
        monthlyData[monthName] += Number(p.amount);
      }
    });

    const revenueChart = Object.keys(monthlyData).map(month => ({
      name: month,
      revenue: monthlyData[month]
    }));

    // Generate Smart Insights deterministically
    const insights = [];
    if (newEnquiries > 0) {
      insights.push({ type: 'positive', message: `🔥 Hot streak: You received ${newEnquiries} new enquiries today!` });
    } else {
      insights.push({ type: 'warning', message: `No new leads today. Time to run a marketing campaign?` });
    }

    if (totalLeads > 0 && conversionRate < 10) {
      insights.push({ type: 'negative', message: `📉 Conversion rate is sitting at ${conversionRate}%. Follow up with active leads!` });
    } else if (conversionRate >= 10) {
      insights.push({ type: 'positive', message: `📈 Great job! Conversion rate is a solid ${conversionRate}%.` });
    }

    if (todaysFollowUps > 0) {
      insights.push({ type: 'warning', message: `⏰ You have ${todaysFollowUps} follow-ups scheduled for today.` });
    }

    if (visaPending > 0) {
      insights.push({ type: 'negative', message: `⚠️ There are ${visaPending} visa applications pending submission.` });
    }

    return {
      sales: {
        newEnquiries,
        activeLeads,
        totalQuotations,
        conversionRate,
        todaysFollowUps,
        agentActivity,
      },
      bookings: {
        upcomingTrips,
        confirmed: confirmedBookings,
        pending: pendingBookings,
      },
      finance: {
        todaysCollection: Number(todaysCollections._sum.amount || 0),
        outstandingBalance: Number(bookingsAgg._sum.balance || 0),
        supplierPayable: Number(supplierPayables._sum.amount || 0),
      },
      operations: {
        visaPending,
        docsPending: 0, 
        flightsPending: 0,
        hotelPending: 0
      },
      recent: {
        leads: recentLeads,
        bookings: recentBookings
      },
      charts: {
        revenue: revenueChart
      },
      insights
    };
  }

  async globalSearch(tenantId: string, query: string) {
    const searchMode: any = 'insensitive';

    const [customers, leads, bookings] = await Promise.all([
      this.prisma.customer.findMany({
        where: {
          tenantId,
          OR: [
            { name: { contains: query, mode: searchMode } },
            { email: { contains: query, mode: searchMode } },
            { phone: { contains: query, mode: searchMode } },
          ],
        },
        take: 5,
        select: { id: true, name: true, phone: true, email: true },
      }),
      this.prisma.lead.findMany({
        where: {
          tenantId,
          OR: [
            { destination: { contains: query, mode: searchMode } },
            { customer: { name: { contains: query, mode: searchMode } } },
          ],
        },
        include: { customer: { select: { name: true } } },
        take: 5,
      }),
      this.prisma.booking.findMany({
        where: {
          tenantId,
          OR: [
            { bookingNumber: { contains: query, mode: searchMode } },
            { destination: { contains: query, mode: searchMode } },
            { customer: { name: { contains: query, mode: searchMode } } },
          ],
        },
        include: { customer: { select: { name: true } } },
        take: 5,
      }),
    ]);

    const results = [
      ...customers.map(c => ({
        id: c.id,
        type: 'customer',
        title: c.name,
        subtitle: c.phone || c.email || 'No contact info',
      })),
      ...leads.map(l => ({
        id: l.id,
        type: 'lead',
        title: `Lead for ${l.customer.name}`,
        subtitle: l.destination || 'No destination',
      })),
      ...bookings.map(b => ({
        id: b.id,
        type: 'booking',
        title: b.bookingNumber,
        subtitle: `${b.customer.name} - ${b.destination}`,
      })),
    ];

    return { data: results };
  }
}
