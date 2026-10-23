"use client";

import React, { useEffect, useState } from 'react';
import { profitApi, BookingPnL, PnLSummary } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const INR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const MarginBadge = ({ pct }: { pct: number }) => {
  const color =
    pct >= 25 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : pct >= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    travelling: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default function ProfitPage() {
  const [summary, setSummary] = useState<PnLSummary | null>(null);
  const [bookings, setBookings] = useState<BookingPnL[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeView, setActiveView] = useState<'summary' | 'bookings'>('summary');
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'revenue'>('profit');

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      };
      const [summaryData, bookingsData] = await Promise.all([
        profitApi.getSummary(params),
        profitApi.getBookingsPnL(params),
      ]);
      setSummary(summaryData);
      setBookings(bookingsData);
    } catch (err) {
      toast.error('Failed to load P&L data');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortBy === 'profit') return b.grossProfit - a.grossProfit;
    if (sortBy === 'margin') return b.marginPercent - a.marginPercent;
    return b.revenue - a.revenue;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            📊 Profit & Loss
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Revenue, supplier costs, and net profit across all bookings
          </p>
        </div>
        {/* Date filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-bold text-gray-500">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-bold text-gray-500">To</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="text-sm text-red-500 hover:text-red-700 font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : summary && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', value: INR(summary.totalRevenue), sub: `${summary.bookingCount} bookings`, icon: '💰', color: 'from-blue-500 to-blue-600' },
              { label: 'Supplier Costs', value: INR(summary.totalSupplierCost), sub: `${summary.totalRevenue > 0 ? ((summary.totalSupplierCost / summary.totalRevenue) * 100).toFixed(1) : 0}% of revenue`, icon: '🏨', color: 'from-orange-500 to-orange-600' },
              { label: 'Other Expenses', value: INR(summary.totalExpenses), sub: `Visa, meals, tips etc.`, icon: '🧾', color: 'from-purple-500 to-purple-600' },
              { label: 'Gross Profit', value: INR(summary.totalGrossProfit), sub: `Avg margin: ${summary.avgMarginPercent.toFixed(1)}%`, icon: summary.totalGrossProfit >= 0 ? '📈' : '📉', color: summary.totalGrossProfit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600' },
            ].map((card) => (
              <div key={card.label} className={`bg-gradient-to-br ${card.color} p-6 rounded-3xl text-white shadow-lg`}>
                <div className="text-3xl mb-2">{card.icon}</div>
                <div className="text-2xl font-extrabold">{card.value}</div>
                <div className="text-sm font-bold opacity-80 mt-1">{card.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-1.5 w-fit border border-white/50 dark:border-gray-700/50">
            {(['summary', 'bookings'] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-5 py-2 rounded-xl font-bold text-sm capitalize transition-all ${
                  activeView === v
                    ? 'bg-primary text-white shadow'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {v === 'summary' ? '📊 Summary' : '📋 By Booking'}
              </button>
            ))}
          </div>

          {activeView === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Destination */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  🌍 Top Destinations by Profit
                </h3>
                <div className="space-y-3">
                  {summary.byDestination.length === 0 ? (
                    <p className="text-gray-400 text-sm">No data yet.</p>
                  ) : summary.byDestination.map((d, i) => {
                    const maxProfit = summary.byDestination[0]?.profit || 1;
                    const barWidth = Math.max(4, (d.profit / maxProfit) * 100);
                    return (
                      <div key={d.destination}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="text-xs text-gray-400">#{i + 1}</span> {d.destination}
                          </span>
                          <div className="text-right">
                            <span className={`text-sm font-extrabold ${d.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{INR(d.profit)}</span>
                            <span className="text-xs text-gray-400 ml-2">{d.bookingCount} bkgs</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${d.profit >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Month */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  📅 Monthly P&L Trend
                </h3>
                <div className="space-y-3">
                  {summary.byMonth.length === 0 ? (
                    <p className="text-gray-400 text-sm">No data yet.</p>
                  ) : summary.byMonth.map(m => {
                    const maxRevenue = Math.max(...summary.byMonth.map(x => x.revenue), 1);
                    const revPct = (m.revenue / maxRevenue) * 100;
                    const profPct = (Math.abs(m.profit) / maxRevenue) * 100;
                    const [year, month] = m.month.split('-');
                    const label = format(new Date(Number(year), Number(month) - 1, 1), 'MMM yyyy');
                    return (
                      <div key={m.month}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>
                          <div className="text-right text-xs">
                            <span className="text-gray-500">{INR(m.revenue)} rev · </span>
                            <span className={m.profit >= 0 ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-500 font-bold'}>{INR(m.profit)} profit</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                          <div className="h-full bg-blue-200 dark:bg-blue-900/50 rounded-full" style={{ width: `${revPct}%` }} />
                          <div
                            className={`h-full absolute top-0 left-0 rounded-full ${m.profit >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                            style={{ width: `${profPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeView === 'bookings' && (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-3 items-center">
                <span className="text-sm font-bold text-gray-500">Sort by:</span>
                {(['profit', 'margin', 'revenue'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${sortBy === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    {s}
                  </button>
                ))}
                <span className="ml-auto text-xs text-gray-400">{sortedBookings.length} bookings</span>
              </div>

              {sortedBookings.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No bookings found for the selected period.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        <th className="p-4">Booking</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Destination</th>
                        <th className="p-4">Travel Date</th>
                        <th className="p-4 text-right">Revenue</th>
                        <th className="p-4 text-right">Supplier Cost</th>
                        <th className="p-4 text-right">Expenses</th>
                        <th className="p-4 text-right">Gross Profit</th>
                        <th className="p-4 text-center">Margin</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {sortedBookings.map(b => (
                        <tr key={b.bookingId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-4">
                            <a href={`/bookings/${b.bookingId}`} className="text-primary font-bold hover:underline">
                              {b.bookingNumber}
                            </a>
                          </td>
                          <td className="p-4 text-gray-700 dark:text-gray-300">{b.customerName}</td>
                          <td className="p-4 text-gray-700 dark:text-gray-300">{b.destination}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {format(new Date(b.travelDate), 'dd MMM yyyy')}
                          </td>
                          <td className="p-4 text-right font-bold text-gray-900 dark:text-white">{INR(b.revenue)}</td>
                          <td className="p-4 text-right text-orange-600 dark:text-orange-400">{INR(b.supplierCost)}</td>
                          <td className="p-4 text-right text-purple-600 dark:text-purple-400">{INR(b.expenses)}</td>
                          <td className={`p-4 text-right font-extrabold ${b.grossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {INR(b.grossProfit)}
                          </td>
                          <td className="p-4 text-center">
                            <MarginBadge pct={b.marginPercent} />
                          </td>
                          <td className="p-4">
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 dark:bg-gray-900/60 border-t-2 border-gray-200 dark:border-gray-700 font-extrabold">
                        <td className="p-4 text-gray-700 dark:text-gray-300" colSpan={4}>Totals</td>
                        <td className="p-4 text-right text-gray-900 dark:text-white">{INR(summary.totalRevenue)}</td>
                        <td className="p-4 text-right text-orange-600 dark:text-orange-400">{INR(summary.totalSupplierCost)}</td>
                        <td className="p-4 text-right text-purple-600 dark:text-purple-400">{INR(summary.totalExpenses)}</td>
                        <td className={`p-4 text-right ${summary.totalGrossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{INR(summary.totalGrossProfit)}</td>
                        <td className="p-4 text-center"><MarginBadge pct={summary.avgMarginPercent} /></td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
