'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmOrderHistory } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  RotateCw,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  CalendarDays,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'placed', label: 'Placed' },
  { value: 'received', label: 'Received' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest_amount', label: 'Highest Amount' },
  { value: 'lowest_amount', label: 'Lowest Amount' }
];

export default function CrmOrderHistoryPage() {
  const { restaurant, role } = useCrmAuthStore();
  const isAdmin = role === 'RESTAURANT_ADMIN';

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [quickRange, setQuickRange] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchHistory = async () => {
    if (!restaurant?._id) return;
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page,
        limit,
        sort: sortOrder
      };

      if (selectedDate) {
        params.date = selectedDate;
      } else if (customFrom || customTo) {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
      } else if (quickRange && quickRange !== 'all') {
        params.quickRange = quickRange;
      } else if (selectedMonth && selectedMonth !== 'all') {
        params.month = selectedMonth;
      }

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (paymentFilter && paymentFilter !== 'all') {
        params.paymentStatus = paymentFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await getCrmOrderHistory(restaurant._id, params);

      setOrders(res.orders || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalRecords(res.pagination?.total || 0);
      if (res.summary) setSummary(res.summary);
      if (res.availableMonths && res.availableMonths.length > 0) {
        setAvailableMonths(res.availableMonths);
      }
    } catch (err: any) {
      console.error('Failed to load order history:', err);
      setError(err?.message || 'Failed to fetch historical orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [
    restaurant?._id,
    selectedMonth,
    selectedDate,
    quickRange,
    statusFilter,
    paymentFilter,
    sortOrder,
    search,
    page
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedDate('');
    setSelectedMonth('all');
    setQuickRange('all');
    setPage(1);
    fetchHistory();
  };

  const handleQuickRangeClick = (rangeKey: string) => {
    setQuickRange(rangeKey);
    setSelectedDate('');
    setSelectedMonth('all');
    setCustomFrom('');
    setCustomTo('');
    setShowCustomRange(false);
    setPage(1);
  };

  const handleMonthChange = (monthKey: string) => {
    setSelectedMonth(monthKey);
    setSelectedDate('');
    setQuickRange('all');
    setCustomFrom('');
    setCustomTo('');
    setShowCustomRange(false);
    setPage(1);
  };

  const handleDateChange = (dateVal: string) => {
    setSelectedDate(dateVal);
    setQuickRange('all');
    setCustomFrom('');
    setCustomTo('');
    setShowCustomRange(false);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">Placed</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">Confirmed</span>;
      case 'preparing':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">Preparing</span>;
      case 'ready':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">Ready</span>;
      case 'out_for_delivery':
      case 'out for delivery':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">Out for Delivery</span>;
      case 'delivered':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Delivered</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">PAID</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">PENDING</span>;
      case 'refunded':
        return <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">REFUNDED</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">FAILED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{status?.toUpperCase() || 'UNPAID'}</span>;
    }
  };

  // Group orders by Month -> Date
  const groupedOrders: { [month: string]: { [day: string]: any[] } } = {};
  orders.forEach((order) => {
    const month = order.monthLabel || 'ARCHIVE';
    const day = order.dayLabel || 'Recent Orders';
    if (!groupedOrders[month]) groupedOrders[month] = {};
    if (!groupedOrders[month][day]) groupedOrders[month][day] = [];
    groupedOrders[month][day].push(order);
  });

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader onSync={fetchHistory} syncing={loading} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Back Navigation & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href="/orders"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Current Orders</span>
              </Link>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Order History</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browse and review all restaurant orders by date and month from the operational database.
              </p>
            </div>

            <button
              onClick={() => fetchHistory()}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh History</span>
            </button>
          </div>

          {/* Month / Date Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Matching Orders</span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalOrders || 0}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">In selected timeframe & filters</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Orders</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{summary.completedOrders || 0}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Fulfilled and delivered safely</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cancelled Orders</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{summary.cancelledOrders || 0}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Operational cancellations</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isAdmin ? 'Gross Revenue' : 'Average Basket'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isAdmin
                  ? `₹${Number(summary.totalRevenue || 0).toLocaleString('en-IN')}`
                  : `${summary.totalOrders > 0 ? `${summary.totalOrders} total` : '0'}`}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {isAdmin
                  ? `₹${summary.avgOrderValue || 0} avg per order`
                  : 'Kitchen operational count'}
              </p>
            </div>
          </div>

          {/* Comprehensive Date & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            {/* Quick Date Filters */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { key: 'all', label: 'All Dates' },
                  { key: 'today', label: 'Today' },
                  { key: 'yesterday', label: 'Yesterday' },
                  { key: 'this_week', label: 'This Week' },
                  { key: 'this_month', label: 'This Month' },
                  { key: 'last_month', label: 'Last Month' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleQuickRangeClick(item.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      quickRange === item.key && !selectedDate && !customFrom && selectedMonth === 'all'
                        ? 'bg-slate-900 dark:bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={() => setShowCustomRange(!showCustomRange)}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    showCustomRange || customFrom || customTo
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Custom Range</span>
                </button>
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Range Collapsible */}
            {showCustomRange && (
              <form
                onSubmit={handleApplyCustomRange}
                className="p-3.5 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/60 rounded-xl flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200">Custom Date Range:</span>
                <div className="flex items-center space-x-2">
                  <label className="text-slate-500 dark:text-slate-400">From:</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-slate-500 dark:text-slate-400">To:</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition cursor-pointer shadow-xs"
                >
                  Apply
                </button>
                {(customFrom || customTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFrom('');
                      setCustomTo('');
                      setShowCustomRange(false);
                      setQuickRange('all');
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </form>
            )}

            {/* Selectors Bar: Month, Date, Status, Payment, Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Month Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  <option value="all">All Months</option>
                  {availableMonths.map((m: any) => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Specific Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Order Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Payment
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  {PAYMENT_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Orders */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Search
                </label>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Order #, name, phone..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </form>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grouped Orders Table / List */}
          {loading && orders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-xs">
              <RotateCw className="w-6 h-6 text-orange-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Retrieving historical order records from database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-xs space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No orders found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                {selectedDate
                  ? `No orders were placed on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                  : selectedMonth !== 'all'
                  ? `No orders found for the selected month.`
                  : 'No orders matched your search or status criteria. Try adjusting the date range or reset filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedOrders).map(([monthLabel, days]) => (
                <div key={monthLabel} className="space-y-4">
                  {/* Month Heading */}
                  <div className="flex items-center space-x-3 pt-2">
                    <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                      {monthLabel}
                    </span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  </div>

                  {Object.entries(days).map(([dayLabel, dayOrders]) => (
                    <div
                      key={dayLabel}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
                    >
                      {/* Day Heading */}
                      <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{dayLabel}</h4>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {dayOrders.length} {dayOrders.length === 1 ? 'order' : 'orders'}
                        </span>
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="py-2.5 px-5">Order #</th>
                              <th className="py-2.5 px-5">Customer</th>
                              <th className="py-2.5 px-5">Items</th>
                              <th className="py-2.5 px-5">Amount</th>
                              <th className="py-2.5 px-5">Payment</th>
                              <th className="py-2.5 px-5">Status</th>
                              <th className="py-2.5 px-5">Time</th>
                              <th className="py-2.5 px-5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {dayOrders.map((order) => {
                              const itemCount = order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || order.items?.length || 1;
                              return (
                                <tr key={order._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3 px-5 font-mono font-bold text-slate-900 dark:text-white">
                                    {order.orderNumber}
                                  </td>
                                  <td className="py-3 px-5">
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                                      {order.customer?.name || order.customerSnapshot?.name || 'Customer'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                      {order.customer?.phone || order.deliveryAddress?.phone || '—'}
                                    </div>
                                  </td>
                                  <td className="py-3 px-5 text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{itemCount}</span> items
                                  </td>
                                  <td className="py-3 px-5 font-black text-slate-900 dark:text-white">
                                    ₹{order.grandTotal ? order.grandTotal.toFixed(2) : order.total ? order.total.toFixed(2) : '0.00'}
                                  </td>
                                  <td className="py-3 px-5">
                                    {getPaymentBadge(order.paymentStatus)}
                                  </td>
                                  <td className="py-3 px-5">
                                    {getStatusBadge(order.orderStatus || order.status)}
                                  </td>
                                  <td className="py-3 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                    {order.timeLabel || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="py-3 px-5 text-right">
                                    <Link
                                      href={`/orders/${order._id}`}
                                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800/60 text-xs font-bold transition cursor-pointer"
                                    >
                                      <span>View Order</span>
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {dayOrders.map((order) => {
                          const itemCount = order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || order.items?.length || 1;
                          return (
                            <div key={order._id} className="p-4 space-y-2.5">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                                    {order.orderNumber}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {order.customer?.name || order.customerSnapshot?.name || 'Customer'}
                                  </span>
                                </div>
                                {getStatusBadge(order.orderStatus || order.status)}
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                                <span>{itemCount} items • {order.timeLabel}</span>
                                <span className="font-black text-slate-900 dark:text-white">
                                  ₹{order.grandTotal ? order.grandTotal.toFixed(2) : order.total?.toFixed(2) || '0.00'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                {getPaymentBadge(order.paymentStatus)}
                                <Link
                                  href={`/orders/${order._id}`}
                                  className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800/60 text-xs font-bold transition"
                                >
                                  View Order
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {Math.min(totalRecords, (page - 1) * limit + 1)}–{Math.min(totalRecords, page * limit)}
                </strong>{' '}
                of <strong className="text-slate-800 dark:text-slate-200">{totalRecords}</strong> historical orders
              </span>

              <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </CrmGuard>
  );
}
