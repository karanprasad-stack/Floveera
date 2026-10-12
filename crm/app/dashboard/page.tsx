'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmAnalytics } from '@/lib/api';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts';
import {
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RotateCw,
  Calendar,
  UtensilsCrossed,
  Users,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Store,
  ChefHat,
  Truck,
  PackageCheck,
  XCircle,
  HelpCircle
} from 'lucide-react';

// Date range options
const DATE_RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' }
];

// Refined coordinated palette for category donut chart & analytics
// Primary: Burnt Orange, Secondary: Muted Teal, Third: Soft Indigo, Fourth: Dusty Rose, Fifth: Warm Gold, Additional: Slate Blue
const REFINED_CATEGORY_COLORS = [
  '#c2410c', // Burnt orange (primary)
  '#0d9488', // Muted teal (secondary)
  '#6366f1', // Soft indigo (third)
  '#be185d', // Dusty rose (fourth)
  '#d97706', // Warm gold (fifth)
  '#475569', // Slate blue (additional)
  '#64748b'  // Cool slate (fallback)
];
const CATEGORY_COLORS = REFINED_CATEGORY_COLORS;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PLACED: {
    label: 'Placed',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/60',
    icon: ShoppingBag
  },
  RECEIVED: {
    label: 'Received',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-200 dark:border-cyan-800/60',
    icon: PackageCheck
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    icon: CheckCircle2
  },
  PREPARING: {
    label: 'Preparing',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/60',
    icon: ChefHat
  },
  READY: {
    label: 'Ready',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    icon: UtensilsCrossed
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/60',
    icon: Truck
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100/70 dark:bg-emerald-950/60',
    border: 'border-emerald-300 dark:border-emerald-800',
    icon: Check
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/60',
    icon: XCircle
  }
};

export default function CrmDashboardPage() {
  const { user, restaurant, role } = useCrmAuthStore();
  const isAdmin = role === 'RESTAURANT_ADMIN';
  const isManager = role === 'RESTAURANT_MANAGER' || (user as any)?.role === 'MANAGER';
  const canViewFinancials = isAdmin || isManager;

  // Selected date range state
  const [selectedRange, setSelectedRange] = useState<string>('30days');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [appliedCustomStart, setAppliedCustomStart] = useState<string>('');
  const [appliedCustomEnd, setAppliedCustomEnd] = useState<string>('');

  // Top selling metric toggle: 'quantity' | 'revenue'
  const [topSellingMetric, setTopSellingMetric] = useState<'quantity' | 'revenue'>('quantity');

  // Analytics data state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-mounted check for Recharts hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Analytics API
  const fetchAnalytics = async (isManualRefresh = false) => {
    if (!restaurant?._id) return;

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params: Record<string, string> = { range: selectedRange };
      if (selectedRange === 'custom') {
        if (appliedCustomStart) params.startDate = appliedCustomStart;
        if (appliedCustomEnd) params.endDate = appliedCustomEnd;
      }

      const res = await getCrmAnalytics(restaurant._id, params);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load CRM analytics:', err);
      setError(err?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (restaurant?._id) {
      fetchAnalytics();
    }
  }, [restaurant?._id, selectedRange, appliedCustomStart, appliedCustomEnd]);

  // Handle custom date apply
  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setAppliedCustomStart(customStart);
    setAppliedCustomEnd(customEnd);
  };

  // Helper for trend badge
  const renderTrendBadge = (growth?: number | null) => {
    if (growth === undefined || growth === null) return null;
    const isPositive = growth > 0;
    const isZero = growth === 0;

    return (
      <span
        className={`inline-flex items-center space-x-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
          isZero
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            : isPositive
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
        }`}
      >
        {isZero ? null : isPositive ? (
          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
        ) : (
          <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
        )}
        <span>{isPositive ? `+${growth}%` : `${growth}%`}</span>
      </span>
    );
  };

  // Prepare top selling items data sorted by chosen metric
  const sortedTopSellingItems = useMemo(() => {
    if (!data?.topSellingItems || !Array.isArray(data.topSellingItems)) return [];
    const items = [...data.topSellingItems];
    if (topSellingMetric === 'revenue') {
      items.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    } else {
      items.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
    }
    return items.slice(0, 8);
  }, [data?.topSellingItems, topSellingMetric]);

  // Max value for progress bar in top selling items
  const maxTopSellingValue = useMemo(() => {
    if (!sortedTopSellingItems.length) return 1;
    return Math.max(
      ...sortedTopSellingItems.map((item) =>
        topSellingMetric === 'revenue' ? (item.revenue || 0) : (item.quantity || 0)
      ),
      1
    );
  }, [sortedTopSellingItems, topSellingMetric]);

  // Total Category Revenue / Items for Donut Chart center
  const totalCategorySum = useMemo(() => {
    if (!data?.categoryRevenue || !Array.isArray(data.categoryRevenue)) return 0;
    if (canViewFinancials) {
      return data.categoryRevenue.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0);
    }
    return data.categoryRevenue.reduce((sum: number, c: any) => sum + (c.quantity || 0), 0);
  }, [data?.categoryRevenue, canViewFinancials]);

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150 text-slate-900 dark:text-slate-100">
        {/* Top Navbar */}
        <CrmHeader onSync={() => fetchAnalytics(true)} syncing={loading || refreshing} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ========================================================
              1. DASHBOARD HEADER & DATE RANGE SELECTOR
              ======================================================== */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 transition">
            <div>
              <div className="flex items-center space-x-2 mb-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isAdmin
                      ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                  }`}
                >
                  {isAdmin ? 'Admin Console' : isManager ? 'Manager Console' : 'Worker Console'}
                </span>
                <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {restaurant?.name || 'Floveera Restaurant'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Restaurant Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Monitor restaurant performance, revenue, orders, menu popularity, and daily operations.
              </p>
            </div>

            {/* Actions: Refresh & View Orders */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={() => fetchAnalytics(true)}
                disabled={refreshing || loading}
                title="Reload the latest data"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-60"
              >
                <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              <Link
                href="/orders"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Manage Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Date Range Selector Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span>Timeframe:</span>
            </div>

            {/* Range Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              {DATE_RANGES.map((r) => {
                const isActive = selectedRange === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRange(r.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Picker inputs when 'custom' is active */}
          {selectedRange === 'custom' && (
            <form
              onSubmit={handleApplyCustomRange}
              className="bg-orange-50/50 dark:bg-slate-900 border border-orange-200 dark:border-orange-950/60 rounded-2xl p-4 flex flex-wrap items-center gap-3 animate-fadeIn"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">From:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  required
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">To:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  required
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition"
              >
                Apply Range
              </button>
              {appliedCustomStart && appliedCustomEnd && (
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                  Showing: {appliedCustomStart} → {appliedCustomEnd}
                </span>
              )}
            </form>
          )}

          {/* Error Banner if any */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => fetchAnalytics(true)} className="underline font-bold">
                Retry
              </button>
            </div>
          )}

          {/* ========================================================
              2. 6 KPI SUMMARY CARDS
              ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {/* Card 1: Total Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {loading ? '...' : (data?.kpis?.totalOrders ?? 0)}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">vs prev period</span>
                  {renderTrendBadge(data?.kpis?.ordersGrowth)}
                </div>
              </div>
            </div>

            {/* Card 2: Total Revenue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {loading ? (
                    '...'
                  ) : canViewFinancials ? (
                    `₹${Number(data?.kpis?.totalRevenue ?? 0).toLocaleString('en-IN')}`
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">Admin Only</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {canViewFinancials ? 'Qualifying sales' : 'Financial access'}
                  </span>
                  {canViewFinancials ? renderTrendBadge(data?.kpis?.revenueGrowth) : (
                    <span className="text-[10px] text-slate-400 font-medium">Restricted</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 3: Average Order Value (AOV) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Avg Order Value
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {loading ? (
                    '...'
                  ) : canViewFinancials ? (
                    `₹${Number(data?.kpis?.aov ?? 0).toLocaleString('en-IN')}`
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">Admin Only</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {canViewFinancials ? 'Revenue / Orders' : 'Financial metric'}
                  </span>
                  {canViewFinancials ? renderTrendBadge(data?.kpis?.aovGrowth) : null}
                </div>
              </div>
            </div>

            {/* Card 4: Pending Orders */}
            <Link
              href="/orders?status=PLACED"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition">
                  Pending Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {loading ? '...' : (data?.kpis?.pendingOrders ?? 0)}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Awaiting kitchen</span>
                  <span className="text-[11px] font-bold text-amber-600 group-hover:underline flex items-center">
                    Review <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 5: Completed Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Completed
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {loading ? '...' : (data?.kpis?.completedOrders ?? 0)}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Fulfilled orders</span>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Delivered
                  </span>
                </div>
              </div>
            </div>

            {/* Card 6: Cancellation Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cancellation Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                  {loading ? '...' : `${data?.kpis?.cancellationRate ?? 0}%`}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {data?.kpis?.cancelledOrders ?? 0} cancelled
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      (data?.kpis?.cancellationRate ?? 0) <= 5
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                    }`}
                  >
                    {(data?.kpis?.cancellationRate ?? 0) <= 5 ? 'Healthy' : 'Needs Review'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              3. ORDERS & REVENUE COMBINATION CHART
              ======================================================== */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Orders & Revenue Trends</span>
                  {data?.trends?.isHourly && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
                      Hourly View
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparative performance showing order volume (orange bars) alongside revenue (teal line).
                </p>
              </div>

              {/* Chart Legend Badges */}
              <div className="flex items-center space-x-4 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#ea580c] opacity-90" />
                  <span className="text-slate-700 dark:text-slate-300">Orders</span>
                </div>
                {canViewFinancials && (
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3.5 h-0.5 bg-[#0d9488] rounded-full" />
                    <span className="text-slate-700 dark:text-slate-300">Revenue (₹)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-72 sm:h-80">
              {loading || !mounted ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  <RotateCw className="w-5 h-5 text-orange-600 animate-spin mr-2" />
                  Loading trends chart...
                </div>
              ) : !data?.trends?.data || data.trends.data.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <span>No order trends recorded for the selected timeframe.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={data.trends.data}
                    margin={{ top: 12, right: 12, left: -6, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(148, 163, 184, 0.12)"
                    />
                    <XAxis
                      dataKey="timeLabel"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                      interval={data.trends.data.length > 14 ? Math.ceil(data.trends.data.length / 8) : 0}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis
                      yAxisId="orders"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      domain={[0, (dataMax: number) => Math.max(dataMax <= 4 ? 5 : Math.ceil(dataMax * 1.25), 5)]}
                      tick={{ fill: '#94a3b8' }}
                    />
                    {canViewFinancials && (
                      <YAxis
                        yAxisId="revenue"
                        orientation="right"
                        stroke="#0d9488"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, (dataMax: number) => Math.max(dataMax <= 1000 ? 1000 : Math.ceil(dataMax * 1.2), 1000)]}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                        tick={{ fill: '#0d9488' }}
                      />
                    )}
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const ordersVal = payload.find((p) => p.dataKey === 'orders')?.value ?? 0;
                        const revenueVal = payload.find((p) => p.dataKey === 'revenue')?.value ?? 0;

                        return (
                          <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700/60 backdrop-blur-sm min-w-[150px] space-y-1.5">
                            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                              <span className="text-slate-400 font-normal">Date:</span>
                              <span className="text-white">{label}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center text-orange-400 font-medium">
                                <span className="w-2 h-2 rounded-xs bg-[#ea580c] mr-1.5 shrink-0" />
                                Orders:
                              </span>
                              <span className="font-mono font-bold text-white">{ordersVal}</span>
                            </div>
                            {canViewFinancials && (
                              <div className="flex items-center justify-between">
                                <span className="flex items-center text-teal-400 font-medium">
                                  <span className="w-2 h-2 rounded-full bg-[#0d9488] mr-1.5 shrink-0" />
                                  Revenue:
                                </span>
                                <span className="font-mono font-bold text-white">
                                  ₹{Number(revenueVal).toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar
                      yAxisId="orders"
                      dataKey="orders"
                      fill="#ea580c"
                      fillOpacity={0.85}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    {canViewFinancials && (
                      <Line
                        yAxisId="revenue"
                        type="linear"
                        dataKey="revenue"
                        stroke="#0d9488"
                        strokeWidth={2}
                        dot={{ r: 2.5, fill: '#0d9488', stroke: '#0d9488', strokeWidth: 1 }}
                        activeDot={{ r: 4.5, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 1.5 }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ========================================================
              4 & 5. BEST-SELLING FOOD RANKING & CATEGORY REVENUE
              ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Best-Selling Food Ranking */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span>Top-Selling Menu Items</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Ranked from real completed and qualifying customer orders.
                    </p>
                  </div>

                  {/* Metric Selector: Quantity vs Revenue */}
                  <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                    <button
                      onClick={() => setTopSellingMetric('quantity')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                        topSellingMetric === 'quantity'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Quantity Sold
                    </button>
                    {canViewFinancials && (
                      <button
                        onClick={() => setTopSellingMetric('revenue')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                          topSellingMetric === 'revenue'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Revenue (₹)
                      </button>
                    )}
                  </div>
                </div>

                {/* Ranking List */}
                <div className="space-y-3 mt-4">
                  {loading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <RotateCw className="w-4 h-4 text-orange-600 animate-spin mx-auto mb-2" />
                      Calculating menu rankings...
                    </div>
                  ) : !sortedTopSellingItems || sortedTopSellingItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <UtensilsCrossed className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <span>No qualifying food sales recorded in this period.</span>
                    </div>
                  ) : (
                    sortedTopSellingItems.map((item: any, idx: number) => {
                      const rank = idx + 1;
                      const progressWidth = Math.min(
                        100,
                        Math.max(
                          8,
                          ((topSellingMetric === 'revenue' ? (item.revenue || 0) : (item.quantity || 0)) /
                            maxTopSellingValue) *
                            100
                        )
                      );

                      return (
                        <div
                          key={item.id || item.name}
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex items-center space-x-3"
                        >
                          {/* Rank Badge */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              rank === 1
                                ? 'bg-amber-400 text-slate-900 shadow-xs'
                                : rank === 2
                                ? 'bg-slate-300 text-slate-900'
                                : rank === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {rank}
                          </div>

                          {/* Food Photo / Fallback */}
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e: any) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          {/* Info & Progress */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1.5 truncate">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </span>
                                {item.category && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                  {topSellingMetric === 'revenue' && canViewFinancials
                                    ? `₹${Number(item.revenue || 0).toLocaleString('en-IN')}`
                                    : `${item.quantity || 0} units`}
                                </span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                              <div
                                className="bg-orange-600 rounded-full transition-all duration-300"
                                style={{ width: `${progressWidth}%` }}
                              />
                            </div>

                            {/* Secondary stats */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              <span>
                                {canViewFinancials
                                  ? `₹${Number(item.revenue || 0).toLocaleString('en-IN')} revenue`
                                  : `${item.quantity || 0} ordered`}
                              </span>
                              <span>{item.percentage ? `${item.percentage}% of food sales` : ''}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* View Menu Catalog Link */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total ranked items: {sortedTopSellingItems.length}</span>
                <Link
                  href="/menu"
                  className="text-xs font-bold text-orange-600 hover:text-orange-500 flex items-center space-x-1"
                >
                  <span>View Menu Catalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Revenue by Category (Donut Chart) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>{canViewFinancials ? 'Revenue by Food Category' : 'Volume by Category'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {canViewFinancials
                        ? 'Sales share across your menu categories.'
                        : 'Order quantity across menu categories.'}
                    </p>
                  </div>
                </div>

                {loading || !mounted ? (
                  <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
                    <RotateCw className="w-4 h-4 text-orange-600 animate-spin mr-2" />
                    Loading category distribution...
                  </div>
                ) : !data?.categoryRevenue || data.categoryRevenue.length === 0 ? (
                  <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
                    No category data recorded for this period.
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
                    {/* Donut Chart (Proportionate Moderately Thick Ring) */}
                    <div className="relative w-52 h-52 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.categoryRevenue}
                            dataKey={canViewFinancials ? 'revenue' : 'quantity'}
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={92}
                            paddingAngle={3}
                            stroke="transparent"
                          >
                            {data.categoryRevenue.map((entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={REFINED_CATEGORY_COLORS[index % REFINED_CATEGORY_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const item = payload[0].payload;
                              const idx = data.categoryRevenue.findIndex((c: any) => c.category === item.category);
                              const color = REFINED_CATEGORY_COLORS[(idx >= 0 ? idx : 0) % REFINED_CATEGORY_COLORS.length];
                              return (
                                <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700/60 backdrop-blur-sm min-w-[140px]">
                                  <div className="font-bold text-slate-200 capitalize flex items-center space-x-1.5 pb-1 border-b border-slate-800">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    <span>{item.category}</span>
                                  </div>
                                  <div className="mt-1.5 space-y-1 text-[11px]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">
                                        {canViewFinancials ? 'Revenue:' : 'Quantity:'}
                                      </span>
                                      <span className="font-mono font-bold text-white">
                                        {canViewFinancials
                                          ? `₹${Number(item.revenue || 0).toLocaleString('en-IN')}`
                                          : `${item.quantity || 0} units`}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Share:</span>
                                      <span className="font-semibold text-teal-400">
                                        {item.percentage}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Donut Center Display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          TOTAL REVENUE
                        </span>
                        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                          {canViewFinancials
                            ? `₹${totalCategorySum.toLocaleString('en-IN')}`
                            : `${totalCategorySum} units`}
                        </span>
                      </div>
                    </div>

                    {/* Proper Category Legend Beside Chart */}
                    <div className="flex-1 w-full space-y-2">
                      {data.categoryRevenue.map((cat: any, idx: number) => {
                        const color = REFINED_CATEGORY_COLORS[idx % REFINED_CATEGORY_COLORS.length];
                        return (
                          <div
                            key={cat.category}
                            className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition"
                          >
                            <div className="flex items-center space-x-2.5 truncate mr-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                                {cat.category}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              {canViewFinancials ? (
                                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                  ₹{Number(cat.revenue || 0).toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                  {cat.quantity || 0} units
                                </span>
                              )}
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] min-w-[34px] text-right">
                                {cat.percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Categories: {data?.categoryRevenue?.length || 0}</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">Proportional breakdown</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              6 & 7. PEAK ORDERING HOURS & ORDER STATUS DISTRIBUTION
              ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Peak Ordering Hours */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Peak Ordering Hours</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Hourly distribution based on when customers placed orders (00:00 - 23:00).
                    </p>
                  </div>
                </div>

                {/* Busiest Hour Highlight Card */}
                <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200/80 dark:border-orange-900/40 rounded-xl p-3.5 mb-4 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>Busiest Window:</span>
                      <span className="text-orange-600 dark:text-orange-400 font-black">
                        {data?.peakHours?.peakHourFormatted || 'No Orders Yet'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {data?.peakHours?.peakCount > 0
                        ? `Recorded ${data.peakHours.peakCount} orders placed during this surge. Plan kitchen prep accordingly.`
                        : 'No orders logged in the chosen timeframe.'}
                    </p>
                  </div>
                </div>

                {/* 24-Hour Bar Chart */}
                <div className="h-56 sm:h-60 w-full">
                  {loading || !mounted ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      <RotateCw className="w-4 h-4 text-orange-600 animate-spin mr-2" />
                      Loading hourly curve...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data?.peakHours?.hourlyDistribution || []}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis
                          dataKey="label"
                          stroke="#94a3b8"
                          fontSize={9}
                          interval={2}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-md border border-slate-700">
                                <div className="font-bold text-orange-400">{d.label}</div>
                                <div>{d.orders} orders placed</div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="orders"
                          fill="#ea580c"
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Timezone: Local Restaurant Time</span>
                <span className="font-semibold text-slate-600 dark:text-slate-400">Order placement timestamp</span>
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <PackageCheck className="w-4 h-4 text-blue-600" />
                      <span>Order Status Overview</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Operational pipeline across all 8 actual order fulfillment statuses.
                    </p>
                  </div>
                </div>

                {/* Status Multi-segment Visual Progress Bar */}
                {data?.kpis?.totalOrders > 0 && (
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-5">
                    {data?.statusOverview?.map((st: any) => {
                      if (st.count === 0) return null;
                      const isCancelled = st.status === 'CANCELLED';
                      const isDelivered = st.status === 'DELIVERED';
                      const isPending = st.status === 'PLACED';
                      const bgColor = isCancelled
                        ? 'bg-rose-500'
                        : isDelivered
                        ? 'bg-emerald-500'
                        : isPending
                        ? 'bg-blue-500'
                        : 'bg-amber-500';

                      return (
                        <div
                          key={st.status}
                          style={{ width: `${st.percentage}%` }}
                          title={`${st.label}: ${st.count} (${st.percentage}%)`}
                          className={`${bgColor} hover:opacity-80 transition-opacity`}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Status Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {data?.statusOverview?.map((st: any) => {
                    const cfg = STATUS_CONFIG[st.status] || {
                      label: st.label,
                      color: 'text-slate-700',
                      bg: 'bg-slate-100',
                      border: 'border-slate-200',
                      icon: HelpCircle
                    };
                    const IconComp = cfg.icon;

                    return (
                      <Link
                        key={st.status}
                        href={`/orders?status=${st.status}`}
                        className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg} flex flex-col justify-between transition hover:shadow-xs group`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
                          <IconComp className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {st.count}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                            {st.percentage}%
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Click any status to filter the Orders list</span>
                <Link
                  href="/orders"
                  className="font-bold text-orange-600 hover:text-orange-500 flex items-center space-x-1"
                >
                  <span>Orders Console</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================
              8 & 9. RECENT ACTIVITY & OPERATIONAL INSIGHTS
              ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Recent Activity (Timeline - NOT an Orders Table) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Recent Activity</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Live event stream from order confirmations, kitchen status changes, and dispatch.
                    </p>
                  </div>
                </div>

                {/* Timeline Events Feed */}
                <div className="space-y-3.5 mt-2">
                  {loading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <RotateCw className="w-4 h-4 text-orange-600 animate-spin mx-auto mb-2" />
                      Loading recent events...
                    </div>
                  ) : !data?.activityFeed || data.activityFeed.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <span>No recent order events logged.</span>
                    </div>
                  ) : (
                    data.activityFeed.map((act: any) => {
                      const cfg = STATUS_CONFIG[act.status] || {
                        label: act.status,
                        color: 'text-slate-600',
                        bg: 'bg-slate-100 dark:bg-slate-800',
                        border: 'border-slate-200',
                        icon: ShoppingBag
                      };
                      const IconComp = cfg.icon;

                      return (
                        <div
                          key={act.id}
                          className="flex items-start space-x-3 text-xs p-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                        >
                          <div className={`w-7 h-7 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {act.title || act.event}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                                {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {act.message || `Order #${act.orderNumber}`}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Link
                                href={`/orders/${act.orderId}`}
                                className="font-mono text-[10px] font-bold text-orange-600 hover:underline"
                              >
                                #{act.orderNumber}
                              </Link>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-[10px] text-slate-400">By {act.performedBy}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick links to relevant CRM sections */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link href="/orders" className="text-slate-600 dark:text-slate-400 hover:text-orange-600 font-semibold flex items-center space-x-1">
                  <span>View All Orders</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </Link>
                <Link href="/workers" className="text-slate-600 dark:text-slate-400 hover:text-orange-600 font-semibold flex items-center space-x-1">
                  <span>Staff Activity</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Menu and Inventory Operational Insights */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Store className="w-4 h-4 text-orange-600" />
                      <span>Menu & Operational Insights</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      High-level snapshot of catalog availability, staff readiness, and customer retention.
                    </p>
                  </div>
                </div>

                {/* Insight metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
                  {/* Metric 1: Total Menu Dishes */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Catalog Items</span>
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {data?.operationalInsights?.totalMenuItems ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Available on Menu</div>
                  </div>

                  {/* Metric 2: In-Stock Items */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-emerald-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Stock</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {data?.operationalInsights?.inStockMenuItems ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Ready for orders</div>
                  </div>

                  {/* Metric 3: Out of Stock */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-rose-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Out of Stock</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                      {data?.operationalInsights?.outOfStockMenuItems ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Needs restocking</div>
                  </div>

                  {/* Metric 4: Active Staff */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-indigo-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Staff</span>
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {data?.operationalInsights?.totalStaffCount ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Active profiles</div>
                  </div>

                  {/* Metric 5: Online Staff */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-emerald-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Online Staff</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {data?.operationalInsights?.onlineStaffCount ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Live on CRM</div>
                  </div>

                  {/* Metric 6: Repeat Customers */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-orange-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Repeat Orders</span>
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl font-black text-orange-600 dark:text-orange-400">
                      {data?.operationalInsights?.repeatCustomerPercentage ?? 0}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Customer retention</div>
                  </div>
                </div>
              </div>

              {/* Direct module navigation shortcuts */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link
                  href="/menu"
                  className="font-bold text-orange-600 hover:text-orange-500 flex items-center space-x-1"
                >
                  <span>Open Menu Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/workers"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
                >
                  Staff Management →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </CrmGuard>
  );
}
