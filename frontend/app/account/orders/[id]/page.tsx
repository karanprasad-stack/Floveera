'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import { getOrderById } from '@/lib/api';
import { OrderData } from '@/components/account/OrderDetailsModal';
import { ArrowLeft, MapPin, FileText, Store, AlertCircle } from 'lucide-react';

export default function SingleOrderPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err?.message || 'Could not load order details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const steps = [
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStepIndex = order ? steps.findIndex((s) => s.key === order.status) : 0;
  const isCancelled = order?.status === 'cancelled';

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-brand-text font-sans">
        <Navigation />

        {/* Full-width standalone order detail view */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/account/orders"
            className="inline-flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-brand-orange mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>

          {isLoading && (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-card animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-24 bg-gray-100 rounded-2xl" />
              <div className="h-40 bg-gray-100 rounded-2xl" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <h3 className="font-bold text-red-900 mb-1">Order Not Found</h3>
              <p className="text-xs text-red-700 mb-4">{error}</p>
              <Link
                href="/account/orders"
                className="px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-sm"
              >
                View All Orders
              </Link>
            </div>
          )}

          {!isLoading && !error && order && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
              {/* Order Header */}
              <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-display font-extrabold text-brand-blue">
                      ORDER #{order.orderNumber}
                    </h1>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-red-100 text-red-800'
                          : 'bg-brand-orange/15 text-brand-orange'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1.5">
                    <Store className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{order.storeName}</span>
                    <span>•</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Total Amount</p>
                  <p className="font-display font-black text-2xl text-brand-orange">
                    ₹{order.grandTotal}
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-8">
                {/* Status Progress Tracker */}
                {!isCancelled && (
                  <div className="py-3 px-2">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-3.5 left-3 right-3 h-0.5 bg-gray-200 -z-0" />
                      <div
                        className="absolute top-3.5 left-3 h-0.5 bg-brand-orange transition-all duration-500 -z-0"
                        style={{
                          width: `${Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100))}%`
                        }}
                      />

                      {steps.map((step, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isCurrent
                                  ? 'bg-brand-orange text-white ring-4 ring-orange-100'
                                  : isDone
                                  ? 'bg-brand-orange text-white'
                                  : 'bg-white border-2 border-gray-300 text-gray-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-1.5 font-semibold text-center whitespace-nowrap max-w-[65px] truncate ${
                                isCurrent
                                  ? 'text-brand-orange font-bold'
                                  : isDone
                                  ? 'text-gray-800'
                                  : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items Breakdown */}
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-sm mb-3">
                    Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                  </h3>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-100 flex-shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">
                              Quantity: {item.quantity} {item.unit ? `• ${item.unit}` : ''}
                            </p>
                            {item.customization?.spiceLevel && (
                              <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                Spice: {item.customization.spiceLevel}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-blue mb-2.5">
                      <MapPin className="w-4 h-4 text-brand-orange" />
                      <span>Delivery Address</span>
                    </div>
                    <p className="font-bold text-gray-900 text-xs">{order.deliveryAddress.fullName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.deliveryAddress.addressLine1}
                      {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.deliveryAddress.city}, {order.deliveryAddress.state || 'Bihar'} - {order.deliveryAddress.pincode}
                    </p>
                    <p className="text-xs text-gray-600 font-semibold mt-2">
                      Phone: {order.deliveryAddress.phone}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-blue mb-2.5">
                      <FileText className="w-4 h-4 text-brand-orange" />
                      <span>Payment Summary</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                      </div>
                      {order.taxes > 0 && (
                        <div className="flex justify-between">
                          <span>Taxes (GST)</span>
                          <span>₹{order.taxes}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-brand-text text-sm pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-brand-orange font-black">₹{order.grandTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
