'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmOrderById, updateCrmOrderStatus, downloadCrmOrderInvoicePdf } from '@/lib/api';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  RotateCw,
  Truck,
  Check,
  XCircle,
  ChefHat,
  FileText,
  Download
} from 'lucide-react';

const ORDER_FLOW = [
  { status: 'placed', label: 'Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'ready', label: 'Ready' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' }
];

export default function CrmOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { restaurant, user } = useCrmAuthStore();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleDownloadInvoice = async () => {
    if (!restaurant?._id || !order) return;
    setDownloadingInvoice(true);
    try {
      await downloadCrmOrderInvoicePdf(
        restaurant._id, 
        order.orderNumber || orderId, 
        `Flovera-Invoice-${order.orderNumber || orderId}.pdf`
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to download invoice PDF');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const fetchOrderDetail = async () => {
    if (!restaurant?._id || !orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCrmOrderById(restaurant._id, orderId);
      setOrder(res.order || res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [restaurant?._id, orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!restaurant?._id || !orderId) return;
    setUpdating(true);
    setError(null);
    setSuccessNote(null);
    try {
      const res = await updateCrmOrderStatus(restaurant._id, orderId, newStatus, `Status updated to ${newStatus}`);
      setOrder(res.order || { ...order, orderStatus: newStatus });
      setSuccessNote(`Order status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`);
      setTimeout(() => setSuccessNote(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const currentStatus = (order?.orderStatus || order?.status || 'placed').toLowerCase();

  const getNextValidStatuses = (status: string) => {
    switch (status) {
      case 'placed':
        return [
          { status: 'confirmed', label: 'Accept & Confirm', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
          { status: 'cancelled', label: 'Cancel Order', color: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' }
        ];
      case 'confirmed':
        return [
          { status: 'preparing', label: 'Start Preparing (Kitchen)', color: 'bg-amber-600 hover:bg-amber-700 text-white font-bold' },
          { status: 'cancelled', label: 'Cancel Order', color: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' }
        ];
      case 'preparing':
        return [
          { status: 'ready', label: 'Mark Food Ready', color: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' }
        ];
      case 'ready':
        return [
          { status: 'out_for_delivery', label: 'Dispatch (Out for Delivery)', color: 'bg-purple-600 hover:bg-purple-700 text-white font-bold' },
          { status: 'delivered', label: 'Direct Handover / Delivered', color: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' }
        ];
      case 'out_for_delivery':
        return [
          { status: 'delivered', label: 'Confirm Delivered', color: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' }
        ];
      default:
        return [];
    }
  };

  const nextActions = getNextValidStatuses(currentStatus);

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader />

        <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
          {/* Back link */}
          <div className="flex items-center justify-between">
            <Link
              href="/orders"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders List</span>
            </Link>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Source: Floveera Customer Store</span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNote && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNote}</span>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <RotateCw className="w-6 h-6 text-orange-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading order details...</p>
            </div>
          ) : !order ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Order not found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This order does not exist or belong to this workspace.</p>
            </div>
          ) : (
            <>
              {/* Order Status & Actions Banner */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60">
                        #{order.orderNumber || order._id?.slice(-8)?.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white">
                      {order.customer?.name || order.deliveryAddress?.fullName || 'Customer Order'}
                    </h1>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Total Amount</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ₹{Number(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Status progression stepper */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Order Lifecycle Progression
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {ORDER_FLOW.map((step, idx) => {
                      const isDone = ORDER_FLOW.findIndex(s => s.status === currentStatus) >= idx;
                      const isCurrent = currentStatus === step.status;
                      return (
                        <div
                          key={step.status}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            isCurrent
                              ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-500 text-orange-800 dark:text-orange-300 font-bold shadow-xs'
                              : isDone
                              ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium'
                              : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                          }`}
                        >
                          <span className="text-[10px] block opacity-70">Step {idx + 1}</span>
                          <span className="text-xs capitalize">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Action Buttons */}
                {nextActions.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Operational Actions:</span>
                    <div className="flex flex-wrap gap-2">
                      {nextActions.map((act) => (
                        <button
                          key={act.status}
                          onClick={() => handleStatusChange(act.status)}
                          disabled={updating}
                          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer ${act.color}`}
                        >
                          {updating && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Banner Invoice Quick Links */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Order Invoice:</span>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/orders/${order.orderNumber || orderId}/invoice`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Invoice</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleDownloadInvoice}
                      disabled={downloadingInvoice}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition shadow-xs disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 text-orange-600 ${downloadingInvoice ? 'animate-bounce' : ''}`} />
                      <span>{downloadingInvoice ? 'Downloading...' : 'Download PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Items & Customer Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items list */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Ordered Items</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {order.items?.length || 0} unique items
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-bold flex items-center justify-center text-xs">
                            {item.quantity || 1}x
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {item.name || item.product?.name || 'Menu Item'}
                            </p>
                            {item.variant && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500">Variant: {item.variant}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                          </span>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                            ₹{Number(item.price || 0)} each
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-5 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>₹{Number(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {order.tax > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Taxes & GST</span>
                        <span>₹{Number(order.tax).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Delivery Fee</span>
                        <span>₹{Number(order.deliveryFee).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span>Grand Total</span>
                      <span className="text-orange-600 dark:text-orange-400">₹{Number(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer & Delivery Details */}
                <div className="space-y-6">
                  {/* Customer Details */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center space-x-2">
                      <User className="w-4 h-4 text-orange-600" />
                      <span>Customer Details</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Full Name</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">
                          {order.customer?.name || order.deliveryAddress?.fullName || 'Guest Customer'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Phone</span>
                        <a
                          href={`tel:${order.customer?.phone || order.deliveryAddress?.phone}`}
                          className="text-orange-600 dark:text-orange-400 hover:underline font-semibold flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customer?.phone || order.deliveryAddress?.phone || 'No phone'}</span>
                        </a>
                      </div>
                      {order.customer?.email && (
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Email</span>
                          <span className="text-slate-600 dark:text-slate-300">{order.customer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Delivery Address</span>
                    </h3>
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {order.deliveryAddress ? (
                        <>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{order.deliveryAddress.fullName || order.deliveryAddress.street}</p>
                          <p>{order.deliveryAddress.street || order.deliveryAddress.addressLine1}</p>
                          {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                          <p>
                            {[order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.postalCode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-400 dark:text-slate-500">Direct Restaurant Express Delivery</p>
                      )}
                    </div>

                    {order.notes && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase block mb-1">Customer Note:</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-orange-50/50 dark:bg-orange-950/30 p-2.5 rounded-lg border border-orange-100 dark:border-orange-900/40">
                          &quot;{order.notes}&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      Payment Info
                    </h3>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Method:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {order.paymentMethod || 'Online / Card'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Status:</span>
                        <span className={`font-bold capitalize ${
                          order.paymentStatus === 'completed' || order.paymentStatus === 'paid' || order.paymentStatus === 'PAID'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <Link
                        href={`/orders/${order.orderNumber || orderId}/invoice`}
                        className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold transition text-center"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleDownloadInvoice}
                        disabled={downloadingInvoice}
                        className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition shadow-xs disabled:opacity-50"
                      >
                        <Download className={`w-3.5 h-3.5 text-orange-600 ${downloadingInvoice ? 'animate-bounce' : ''}`} />
                        <span>{downloadingInvoice ? 'Downloading...' : 'Download Invoice'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </CrmGuard>
  );
}
