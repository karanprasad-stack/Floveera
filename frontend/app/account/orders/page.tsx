'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import OrderDetailsModal, { OrderData } from '@/components/account/OrderDetailsModal';
import { getMyOrders } from '@/lib/api';
import { Package, Clock, CheckCircle2, AlertCircle, ShoppingBag, ChevronRight, Store, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetails = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 border border-red-200/60 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center space-x-1 bg-orange-50 text-brand-orange border border-orange-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Clock className="w-3 h-3 text-brand-orange animate-pulse" />
            <span>Preparing</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center space-x-1 bg-orange-50 text-brand-orange border border-orange-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3 h-3 text-brand-orange" />
            <span>Confirmed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize">
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status);
    }
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-brand-text font-sans selection:bg-brand-orange selection:text-white">
        <Navigation />

        {/* Independent Full-Width Orders Container - ZERO Sidebar / ZERO Profile Navigation */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-blue tracking-tight">
                My Orders
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Track and manage your recent orders
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200 transition-colors shadow-sm self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Order Status Filters (Not Account Navigation) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-6">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: 'Active' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.id
                    ? 'bg-brand-orange text-white shadow-sm shadow-brand-orange/20'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl mb-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-3 px-4 py-1.5 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orangeHover transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-card animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div className="h-5 bg-gray-200 rounded-lg w-36" />
                    <div className="h-5 bg-gray-200 rounded-full w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Empty Orders State */}
          {!isLoading && !error && filteredOrders.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-12 sm:p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center mb-5 shadow-inner">
                <Package className="w-10 h-10 opacity-70" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-1">
                No orders yet
              </h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                Your orders will appear here after you place your first order.
              </p>
              <Link
                href="/restaurant"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-sm shadow-md shadow-brand-orange/20 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping</span>
              </Link>
            </div>
          )}

          {/* Order Cards List (Full-Width) */}
          {!isLoading && !error && filteredOrders.length > 0 && (
            <div className="space-y-5">
              {filteredOrders.map((order) => {
                const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-cardHover transition-all duration-200 overflow-hidden"
                  >
                    {/* Top Meta Bar */}
                    <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-display font-extrabold text-brand-blue text-base sm:text-lg">
                            ORDER #{order.orderNumber}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formattedDate}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Store className="w-3.5 h-3.5 text-brand-orange" />
                          <span className="font-semibold text-gray-700">{order.storeName}</span>
                          <span>•</span>
                          <span>{totalQty} {totalQty === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="px-5 sm:px-6 py-4 bg-gray-50/40">
                      <div className="space-y-1.5">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-800">
                              {item.name} <span className="text-gray-400 font-normal">× {item.quantity}</span>
                            </span>
                            <span className="font-semibold text-gray-700">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-[11px] text-gray-400 italic pt-1">
                            + {order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions & Total */}
                    <div className="p-5 sm:p-6 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-100">
                      <div className="flex items-baseline space-x-3">
                        <span className="text-xs text-gray-400 font-medium">Order Total:</span>
                        <span className="font-display font-black text-brand-orange text-lg">
                          ₹{order.grandTotal}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold capitalize">
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Cash on Delivery'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-xs shadow-sm shadow-brand-orange/20 transition-all self-stretch sm:self-auto"
                      >
                        <span>View Order Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        <Footer />

        {/* Dedicated Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </AuthGuard>
  );
}
