'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, Clock, MapPin, Store, AlertCircle, Phone, FileText, ChevronRight, PackageCheck, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadInvoicePdf } from '@/lib/api';

export interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  unit?: string;
  image?: string;
  customization?: {
    spiceLevel?: string;
    addOns?: Array<{ name: string; price: number }>;
    notes?: string;
    weight?: string;
    flavor?: string;
    cakeMessage?: string;
    deliveryDate?: string;
    deliverySlot?: string;
    isEggless?: boolean;
  };
}

export interface OrderData {
  _id: string;
  orderNumber: string;
  storeName: string;
  vertical?: string;
  createdAt: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDeliveryTime?: string;
  customerNotes?: string;
  deliveryAddress: {
    label?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state?: string;
    pincode?: string;
  };
  timeline?: Array<{
    status: string;
    title: string;
    message?: string;
    timestamp: string;
  }>;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose
}: {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !order) return null;

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(order.orderNumber || order._id, `Flovera-Invoice-${order.orderNumber}.pdf`);
    } catch (err: any) {
      alert(err?.message || 'Failed to download invoice PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const steps = [
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed':
        return 'Order Placed';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Being Prepared';
      case 'ready':
        return 'Ready for Pickup';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getActiveStatusMessage = () => {
    switch (order.status) {
      case 'placed':
        return 'Your order has been received and is waiting for store acceptance.';
      case 'confirmed':
        return `${order.storeName} has accepted your order!`;
      case 'preparing':
        return 'Your order is being prepared with fresh ingredients.';
      case 'ready':
        return 'Your package is packed and waiting for delivery partner assignment.';
      case 'out_for_delivery':
        return 'Your delivery partner is on the way to your address!';
      case 'delivered':
        return 'This order has been successfully delivered. Enjoy your meal!';
      case 'cancelled':
        return 'This order was cancelled.';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 sticky top-0 z-10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-brand-blue text-lg sm:text-xl">
                  {order.orderNumber}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    order.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCancelled
                      ? 'bg-red-100 text-red-800'
                      : 'bg-brand-orange/15 text-brand-orange'
                  }`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1">
                <span>{order.storeName}</span>
                <span>•</span>
                <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* Live Status Banner */}
            <div
              className={`p-4 rounded-2xl flex items-start space-x-3 ${
                order.status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                  : isCancelled
                  ? 'bg-red-50 text-red-900 border border-red-100'
                  : 'bg-orange-50/80 text-brand-text border border-brand-orange/20'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {order.status === 'delivered' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCancelled ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Clock className="w-5 h-5 text-brand-orange animate-pulse" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {order.status === 'delivered'
                    ? 'Delivered Successfully'
                    : isCancelled
                    ? 'Order Cancelled'
                    : order.estimatedDeliveryTime
                    ? `Estimated Delivery: ${order.estimatedDeliveryTime}`
                    : 'Order In Progress'}
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  {getActiveStatusMessage()}
                </p>
              </div>
            </div>

            {/* Visual Step Progress Tracker (Only for non-cancelled) */}
            {!isCancelled ? (
              <div className="py-2 px-1">
                <div className="flex items-center justify-between relative">
                  {/* Connecting Line */}
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
                          className={`text-[10px] mt-1.5 font-semibold text-center whitespace-nowrap max-w-[60px] truncate ${
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
            ) : null}

            {/* Ordered Items List */}
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm mb-3">
                Items in this Order ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} {item.unit ? `• ${item.unit}` : ''}
                        </p>
                        {item.customization?.spiceLevel && (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Spice: {item.customization.spiceLevel}
                          </span>
                        )}
                        {item.customization?.addOns && item.customization.addOns.length > 0 && (
                          <p className="text-[11px] text-gray-500">
                            Add-ons: {item.customization.addOns.map(a => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm ml-3 flex-shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address & Customer Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-blue mb-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Delivery Address</span>
                </div>
                <p className="font-semibold text-gray-900 text-xs">
                  {order.deliveryAddress.fullName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.deliveryAddress.addressLine1}
                  {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                </p>
                {order.deliveryAddress.landmark && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Landmark: {order.deliveryAddress.landmark}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state || 'Bihar'} - {order.deliveryAddress.pincode}
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">
                  Phone: {order.deliveryAddress.phone}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-blue mb-2">
                    <FileText className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Payment & Instructions</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-bold">Method:</span>{' '}
                    <span className="capitalize">{order.paymentMethod}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    <span className="font-bold">Payment Status:</span>{' '}
                    <span className="capitalize text-emerald-700 font-bold">{order.paymentStatus}</span>
                  </p>
                  {order.customerNotes && (
                    <p className="text-xs text-gray-500 mt-2 bg-white p-2 rounded-xl border border-gray-100 italic">
                      "{order.customerNotes}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill / Price Breakdown */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="font-display font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                Bill Summary
              </h4>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Item Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              {order.taxes > 0 && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Taxes (GST)</span>
                  <span>₹{order.taxes}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                  <span>Discounts Applied</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-base text-brand-text">
                <span>Total Paid</span>
                <span className="text-brand-orange font-black">₹{order.grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Link
                href={`/orders/${order.orderNumber || order._id}/invoice`}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-brand-orange border border-orange-200 font-bold text-xs transition-colors flex-1 sm:flex-initial"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Invoice</span>
              </Link>
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs transition-colors shadow-2xs flex-1 sm:flex-initial disabled:opacity-60"
              >
                <Download className={`w-3.5 h-3.5 text-brand-orange ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Downloading...' : 'Download Invoice'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
