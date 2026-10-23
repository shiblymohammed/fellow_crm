"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { format, subDays } from 'date-fns';
import { Download, Calendar as CalendarIcon, FileSpreadsheet, Briefcase, CreditCard, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'bookings' | 'payments'>('bookings');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/reports?startDate=${startDate}&endDate=${endDate}`);
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch report", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    const data = report.data[activeTab];

    if (data.length === 0) return alert("No data to export");

    // Extract headers
    let headers: string[] = [];
    if (activeTab === 'leads') headers = ['ID', 'Customer', 'Destination', 'Status', 'Created At'];
    if (activeTab === 'bookings') headers = ['ID', 'Customer', 'Destination', 'Status', 'Total Amount', 'Created At'];
    if (activeTab === 'payments') headers = ['ID', 'Booking Ref', 'Customer', 'Amount', 'Method', 'Paid At'];

    csvContent += headers.join(",") + "\n";

    // Extract rows
    data.forEach((row: any) => {
      let rowArray: string[] = [];
      if (activeTab === 'leads') {
        rowArray = [row.id, row.customer?.name || 'Unknown', row.destination || 'TBD', row.status, row.createdAt];
      }
      if (activeTab === 'bookings') {
        rowArray = [row.id, row.customer?.name || 'Unknown', row.destination || 'TBD', row.status, row.totalAmount, row.createdAt];
      }
      if (activeTab === 'payments') {
        rowArray = [row.id, row.booking?.bookingNumber, row.booking?.customer?.name, row.amount, row.paymentMethod, row.paidAt];
      }
      // Escape commas in cells
      rowArray = rowArray.map(cell => `"${String(cell).replace(/"/g, '""')}"`);
      csvContent += rowArray.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detailed Reports</h1>
          <p className="text-gray-500 text-sm">Analyze your agency's performance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 dark:text-gray-300"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 dark:text-gray-300"
            />
          </div>
          <button 
            onClick={fetchReport}
            className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {isLoading || !report ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Leads</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{report.summary.totalLeads}</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-emerald-600">{report.summary.conversionRate}%</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Bookings</p>
              <h3 className="text-2xl font-bold text-indigo-600">{report.summary.totalBookings}</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Collected Revenue</p>
              <h3 className="text-2xl font-bold text-blue-600">{formatCurrency(report.summary.totalCollected)}</h3>
            </div>
          </div>

          {/* Data Tables & Export */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <Briefcase className="w-4 h-4" /> Bookings
                </button>
                <button 
                  onClick={() => setActiveTab('payments')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 ${activeTab === 'payments' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <CreditCard className="w-4 h-4" /> Payments
                </button>
                <button 
                  onClick={() => setActiveTab('leads')}
                  className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 ${activeTab === 'leads' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <Filter className="w-4 h-4" /> Leads Funnel
                </button>
              </div>

              <button 
                onClick={exportToCSV}
                className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    {activeTab === 'bookings' && (
                      <>
                        <th className="p-4 font-semibold">Ref</th>
                        <th className="p-4 font-semibold">Customer</th>
                        <th className="p-4 font-semibold">Destination</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Amount</th>
                      </>
                    )}
                    {activeTab === 'payments' && (
                      <>
                        <th className="p-4 font-semibold">Ref</th>
                        <th className="p-4 font-semibold">Customer</th>
                        <th className="p-4 font-semibold">Method</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold text-right">Amount</th>
                      </>
                    )}
                    {activeTab === 'leads' && (
                      <>
                        <th className="p-4 font-semibold">Customer</th>
                        <th className="p-4 font-semibold">Destination</th>
                        <th className="p-4 font-semibold">Assigned</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold text-right">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {report.data[activeTab].length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No data available for this period.</td>
                    </tr>
                  ) : (
                    report.data[activeTab].map((row: any) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        {activeTab === 'bookings' && (
                          <>
                            <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">{row.bookingNumber || row.id.slice(-6)}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.customer?.name}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.destination}</td>
                            <td className="p-4 text-sm">
                              <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded font-medium">{row.status}</span>
                            </td>
                            <td className="p-4 text-sm font-bold text-right text-gray-900 dark:text-gray-100">{formatCurrency(Number(row.totalAmount))}</td>
                          </>
                        )}
                        {activeTab === 'payments' && (
                          <>
                            <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">{row.booking?.bookingNumber}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.booking?.customer?.name}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.paymentMethod}</td>
                            <td className="p-4 text-sm text-gray-500">{format(new Date(row.paidAt), 'MMM dd, yyyy')}</td>
                            <td className="p-4 text-sm font-bold text-right text-emerald-600">{formatCurrency(Number(row.amount))}</td>
                          </>
                        )}
                        {activeTab === 'leads' && (
                          <>
                            <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">{row.customer?.name}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.destination || '-'}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.assignedUser?.name || 'Unassigned'}</td>
                            <td className="p-4 text-sm text-gray-500">{format(new Date(row.createdAt), 'MMM dd, yyyy')}</td>
                            <td className="p-4 text-sm text-right">
                              <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded font-medium uppercase tracking-wider">{row.status}</span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
