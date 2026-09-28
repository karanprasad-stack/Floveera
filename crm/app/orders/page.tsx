'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmOrders } from '@/lib/api';
import {
  Search,
  ShoppingBag,
  RotateCw,
  ChevronRight,
  Filter,
  History
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'placed', label: 'Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' }
];

export default function CrmOrdersPage() {
  const { restaurant } = useCrmAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    if (!restaurant?._id) return;
    setLoading(true);
    try {
      const res = await getCrmOrders(restaurant._id, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter,
        search: search.trim() || undefined,
        page,
        limit: 20
      });
      setOrders(res.orders || []);
      setTotalPages(res.pagination?.pages || 1);
      setTotalOrders(res.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching CRM orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurant?._id, statusFilter, paymentFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Placed</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Confirmed</span>;
      case 'preparing':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Preparing</span>;
      case 'ready':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Ready</span>;
      case 'out_for_delivery':
      case 'out for delivery':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Out for Delivery</span>;
      case 'delivered':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Delivered</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader onSync={fetchOrders} syncing={loading} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Restaurant Orders</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Incoming food orders and dispatch operations ({totalOrders} total)
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <Link
                href="/orders/history"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-xl transition shadow-xs cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Order History</span>
              </Link>
              <button
                onClick={() => fetchOrders()}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition shadow-xs cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-orange-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Secondary Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Order #, Customer Name, or Phone..."
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Search
                </button>
              </form>

              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="PAID">Paid / Completed</option>
                <option value="PENDING">Pending Payment</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Order #</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Items</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Payment</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex justify-center items-center space-x-2">
                          <RotateCw className="w-4 h-4 text-orange-600 animate-spin" />
                          <span>Loading orders...</span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-500">
                        <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No orders found</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {search || statusFilter !== 'all' || paymentFilter !== 'all'
                            ? 'Try adjusting your search filters'
                            : 'Incoming orders from Floveera customer store will show here'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const itemCount = order.items?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || order.items?.length || 0;
                      return (
                        <tr key={order._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                              #{order.orderNumber || order._id?.slice(-8)?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-slate-800 dark:text-slate-100 block text-xs">
                              {order.customer?.name || order.deliveryAddress?.fullName || 'Customer'}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {order.customer?.phone || order.deliveryAddress?.phone || 'No phone'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{itemCount}</span> items
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white text-xs">
                            ₹{Number(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-5 text-xs">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              order.paymentStatus === 'completed' || order.paymentStatus === 'paid' || order.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                            }`}>
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            {getStatusBadge(order.orderStatus || order.status)}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <Link
                              href={`/orders/${order._id}`}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-xs transition"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </CrmGuard>
  );
}
