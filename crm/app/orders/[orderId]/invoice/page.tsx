'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmOrderInvoice, downloadCrmOrderInvoicePdf } from '@/lib/api';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Mail, 
  RotateCw, 
  FileText 
} from 'lucide-react';

export default function CrmOrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const { restaurant, user } = useCrmAuthStore();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchInvoice = async () => {
    if (!restaurant?._id || !orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCrmOrderInvoice(restaurant._id, orderId);
      setInvoice(data);
    } catch (err: any) {
      console.error('CRM Invoice fetch error:', err);
      setError(err?.message || 'Invoice unavailable for this order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [restaurant?._id, orderId]);

  const handleDownload = async () => {
    if (!restaurant?._id || !invoice) return;
    setDownloading(true);
    try {
      await downloadCrmOrderInvoicePdf(
        restaurant._id, 
        invoice.orderNumber || orderId, 
        `Flovera-Invoice-${invoice.orderNumber || orderId}.pdf`
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to download invoice PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const isPaid = (invoice?.paymentStatus || '').toUpperCase() === 'PAID';
  const taxAmount = invoice?.tax !== undefined ? invoice.tax : (invoice?.taxes || 0);

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <div className="print:hidden">
          <CrmHeader />
        </div>

        <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* Top Actions (Hidden in Print) */}
          <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Order #{invoice?.orderNumber || orderId}</span>
            </Link>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Invoice</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || !invoice}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? 'Generating PDF...' : 'Download Invoice'}</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
              <RotateCw className="w-7 h-7 text-orange-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading invoice...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Invoice Unavailable</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{error}</p>
              <button
                onClick={fetchInvoice}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Invoice Document Sheet */}
          {!loading && !error && invoice && (
            <div 
              id="printable-invoice" 
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0"
            >
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-orange-600 font-display">
                      FLOVERA
                    </span>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                      Tax Invoice
                    </span>
                  </div>
                  
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{invoice.restaurantSnapshot?.name}</p>
                    <p>{invoice.restaurantSnapshot?.address}, {invoice.restaurantSnapshot?.city}</p>
                    <p>{invoice.restaurantSnapshot?.state} - {invoice.restaurantSnapshot?.pincode}, India</p>
                    <p className="pt-0.5">
                      <span>Phone: {invoice.restaurantSnapshot?.phone}</span>
                      <span className="mx-1.5">•</span>
                      <span>Email: {invoice.restaurantSnapshot?.email}</span>
                    </p>
                    {invoice.restaurantSnapshot?.gstin && (
                      <p className="font-semibold text-slate-800">
                        GSTIN: <span className="font-mono">{invoice.restaurantSnapshot.gstin}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Metadata */}
                <div className="bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-none border-slate-200/80 text-left md:text-right">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display mb-2">
                    INVOICE
                  </h2>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-500 mr-2 md:mr-0 md:block text-[11px] font-medium">Invoice No:</span>
                      <span className="font-mono font-bold text-orange-600 text-sm tracking-wide">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 mr-2 md:mr-0 md:block text-[11px] font-medium">Order No:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {invoice.orderNumber}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 mr-2 md:mr-0 md:block text-[11px] font-medium">Order Date:</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(invoice.orderDate)}
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 mr-2 md:mr-0 md:block text-[11px] font-medium">Issued At:</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(invoice.issuedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="py-6 border-b border-slate-200">
                <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-2">
                  BILL TO / CUSTOMER DETAILS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {invoice.customerSnapshot?.deliveryAddress?.fullName || invoice.customerSnapshot?.name}
                    </p>
                    <p className="text-slate-600 mt-1 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{invoice.customerSnapshot?.deliveryAddress?.phone || invoice.customerSnapshot?.phone}</span>
                    </p>
                    {invoice.customerSnapshot?.email && (
                      <p className="text-slate-600 flex items-center space-x-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{invoice.customerSnapshot.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <span className="text-slate-500 block text-[11px] font-semibold mb-0.5">Delivery Address:</span>
                    <p className="text-slate-700 leading-relaxed">
                      {invoice.customerSnapshot?.deliveryAddress?.addressLine1}
                      {invoice.customerSnapshot?.deliveryAddress?.addressLine2 && `, ${invoice.customerSnapshot.deliveryAddress.addressLine2}`}
                      {invoice.customerSnapshot?.deliveryAddress?.landmark && ` (Near ${invoice.customerSnapshot.deliveryAddress.landmark})`}
                    </p>
                    <p className="text-slate-700 font-medium">
                      {invoice.customerSnapshot?.deliveryAddress?.city}, {invoice.customerSnapshot?.deliveryAddress?.state || 'Bihar'} - {invoice.customerSnapshot?.deliveryAddress?.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-6 border-b border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3">Item Description</th>
                      <th className="py-3 px-3 text-center">Qty</th>
                      <th className="py-3 px-3 text-right">Price</th>
                      <th className="py-3 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.itemsSnapshot?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.nameSnapshot}</p>
                          <div className="text-[11px] text-slate-500 space-x-1">
                            {item.variant && <span>{item.variant}</span>}
                            {item.addons && item.addons.length > 0 && (
                              <span>• Add-ons: {item.addons.map((a: any) => a.name).join(', ')}</span>
                            )}
                            {item.notes && <span>• Note: {item.notes}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700 font-medium">
                          ₹{item.priceSnapshot}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ₹{item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="py-6 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-end">
                <div className="w-full sm:w-80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{invoice.subtotal}</span>
                  </div>

                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="font-bold">-₹{invoice.discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-800">
                      {invoice.deliveryFee === 0 ? 'FREE' : `₹${invoice.deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST ({invoice.taxDetails?.rate || 5}%)</span>
                    <span className="font-semibold text-slate-800">₹{taxAmount}</span>
                  </div>

                  {taxAmount > 0 && invoice.taxDetails && (
                    <div className="text-[11px] text-slate-500 text-right pr-1">
                      CGST {((invoice.taxDetails.rate || 5) / 2).toFixed(1)}%: ₹{invoice.taxDetails.cgst} • SGST {((invoice.taxDetails.rate || 5) / 2).toFixed(1)}%: ₹{invoice.taxDetails.sgst}
                    </div>
                  )}

                  <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                    <span className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                      TOTAL
                    </span>
                    <span className="font-display font-black text-orange-600 text-xl sm:text-2xl">
                      ₹{invoice.grandTotal || invoice.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Order Status */}
              <div className="py-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                    Payment Method
                  </span>
                  <span className="font-bold text-slate-900 text-sm uppercase">
                    {invoice.paymentMethod || 'Online'}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                    Payment Status
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {isPaid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-700 uppercase">PAID</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-amber-700 uppercase">
                          {invoice.paymentStatus || 'PENDING'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                    Order Status
                  </span>
                  <span className="font-bold text-orange-600 text-sm uppercase">
                    {invoice.orderStatus || 'CONFIRMED'}
                  </span>
                </div>
              </div>

              {/* Compliance Footer */}
              <div className="pt-6 text-center text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">Restaurant CRM Invoice View</p>
                <p className="text-[11px]">This is an electronically generated tax invoice matching the customer invoice record.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </CrmGuard>
  );
}
