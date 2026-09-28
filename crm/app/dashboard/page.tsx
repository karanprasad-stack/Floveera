'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmDashboard } from '@/lib/api';
import {
  ShoppingBag,
  Clock,
  IndianRupee,
  Flame,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  Truck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function CrmDashboardPage() {
  const { user, restaurant, role } = useCrmAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === 'RESTAURANT_ADMIN';

  const loadDashboard = async () => {
    if (!restaurant?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCrmDashboard(restaurant._id);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurant?._id) {
      loadDashboard();
    }
  }, [restaurant?._id]);

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
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        {/* Top Header */}
        <CrmHeader onSync={loadDashboard} syncing={loading} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Operations Dashboard Hero Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isAdmin 
                    ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60' 
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                }`}>
                  {isAdmin ? 'Admin Console' : 'Worker Console'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{restaurant?.name || 'Floveera Restaurant'}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Operations Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {isAdmin
                  ? 'Real-time overview of incoming customer orders, kitchen status, revenue, and daily fulfillment.'
                  : 'Live kitchen and dispatch pipeline for order preparation, packing, and delivery handoff.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <Link
                href="/orders"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Manage All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Operational Metrics KPI Cards */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
            {/* Card 1: Today's Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today&apos;s Orders</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : (data?.todayOrders ?? 0)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total orders received today</p>
            </div>

            {/* Card 2: Pending Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Orders</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {loading ? '...' : (data?.pendingOrders ?? 0)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Awaiting kitchen confirmation</p>
            </div>

            {/* Card 3: Today's Revenue — STRICTLY ADMIN ONLY */}
            {isAdmin && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today&apos;s Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  {loading ? '...' : `₹${Number(data?.todayRevenue ?? 0).toLocaleString('en-IN')}`}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Gross order fulfillment value</p>
              </div>
            )}

            {/* Card 4: Active Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Orders</span>
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-orange-600 dark:text-orange-400">
                {loading ? '...' : (data?.activeOrders ?? 0)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">In kitchen prep or transit</p>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Orders</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest customer orders placed through Floveera.
                </p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Order #</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Items</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <div className="flex justify-center items-center space-x-2">
                          <RotateCw className="w-4 h-4 text-orange-600 animate-spin" />
                          <span>Loading orders...</span>
                        </div>
                      </td>
                    </tr>
                  ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No recent orders yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Customer orders will appear here automatically in real time</p>
                      </td>
                    </tr>
                  ) : (
                    data.recentOrders.map((order: any) => {
                      const itemCount = order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || order.items?.length || 0;
                      return (
                        <tr key={order._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                              #{order.orderNumber || order._id?.slice(-8)?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                              {order.customer?.name || order.deliveryAddress?.fullName || 'Customer'}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {order.customer?.phone || order.deliveryAddress?.phone || 'No phone'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{itemCount}</span> items
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                            ₹{Number(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-5">
                            {getStatusBadge(order.orderStatus || order.status)}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <Link
                              href={`/orders/${order._id}`}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
                            >
                              <span>View Order</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </CrmGuard>
  );
}
