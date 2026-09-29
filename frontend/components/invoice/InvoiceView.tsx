'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { downloadInvoicePdf } from '@/lib/api';

export interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  orderNumber: string;
  orderId: string;
  orderDate: string;
  issuedAt: string;
  customerSnapshot: {
    name: string;
    phone: string;
    email?: string;
    deliveryAddress: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      landmark?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  restaurantSnapshot: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    gstin?: string;
  };
  itemsSnapshot: Array<{
    nameSnapshot: string;
    skuSnapshot?: string;
    priceSnapshot: number;
    quantity: number;
    variant?: string;
    addons?: Array<{ name: string; price: number }>;
    notes?: string;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  taxes?: number;
  taxDetails?: {
    rate: number;
    cgst: number;
    sgst: number;
    igst: number;
  };
  total: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
}

interface InvoiceViewProps {
  invoice: InvoiceData;
  backHref?: string;
  onDownloadOverride?: () => Promise<void>;
}

export default function InvoiceView({ invoice, backHref = '/account/orders', onDownloadOverride }: InvoiceViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      if (onDownloadOverride) {
        await onDownloadOverride();
      } else {
        await downloadInvoicePdf(invoice.orderNumber || invoice.orderId, `Flovera-Invoice-${invoice.orderNumber}.pdf`);
      }
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err?.message || 'Failed to download PDF invoice. Please try again.');
    } finally {
      setIsDownloading(false);
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

  const isPaid = (invoice.paymentStatus || '').toUpperCase() === 'PAID';
  const taxAmount = invoice.tax !== undefined ? invoice.tax : (invoice.taxes || 0);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            type="button"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-orange-600/20 disabled:opacity-70"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Invoice'}</span>
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="print:hidden bg-red-50 border border-red-200 p-4 rounded-2xl mb-6 flex items-center space-x-3 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <p>{downloadError}</p>
        </div>
      )}

      {/* The Printable A4 Invoice Card */}
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
                Official Bill
              </span>
            </div>
            
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{invoice.restaurantSnapshot.name}</p>
              <p>{invoice.restaurantSnapshot.address}, {invoice.restaurantSnapshot.city}</p>
              <p>{invoice.restaurantSnapshot.state} - {invoice.restaurantSnapshot.pincode}, India</p>
              <p className="pt-0.5">
                <span>Phone: {invoice.restaurantSnapshot.phone}</span>
                <span className="mx-1.5">•</span>
                <span>Email: {invoice.restaurantSnapshot.email}</span>
              </p>
              {invoice.restaurantSnapshot.gstin && (
                <p className="font-semibold text-slate-800">
                  GSTIN: <span className="font-mono">{invoice.restaurantSnapshot.gstin}</span>
                </p>
              )}
            </div>
          </div>

          {/* Invoice & Order Metadata Box */}
          <div className="bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-none border-slate-200/80 text-left md:text-right">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display mb-2">
              TAX INVOICE
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
                <span className="text-slate-500 mr-2 md:mr-0 md:block text-[11px] font-medium">Invoice Issued:</span>
                <span className="font-medium text-slate-700">
                  {formatDate(invoice.issuedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Delivery Address Section */}
        <div className="py-6 border-b border-slate-200">
          <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-2">
            BILL TO / DELIVER TO
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-900 text-sm">
                {invoice.customerSnapshot.deliveryAddress?.fullName || invoice.customerSnapshot.name}
              </p>
              <p className="text-slate-600 mt-1 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{invoice.customerSnapshot.deliveryAddress?.phone || invoice.customerSnapshot.phone}</span>
              </p>
              {invoice.customerSnapshot.email && (
                <p className="text-slate-600 flex items-center space-x-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{invoice.customerSnapshot.email}</span>
                </p>
              )}
            </div>

            <div className="bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <span className="text-slate-500 block text-[11px] font-semibold mb-0.5">Delivery Address:</span>
              <p className="text-slate-700 leading-relaxed">
                {invoice.customerSnapshot.deliveryAddress?.addressLine1}
                {invoice.customerSnapshot.deliveryAddress?.addressLine2 && `, ${invoice.customerSnapshot.deliveryAddress.addressLine2}`}
                {invoice.customerSnapshot.deliveryAddress?.landmark && ` (Near ${invoice.customerSnapshot.deliveryAddress.landmark})`}
              </p>
              <p className="text-slate-700 font-medium">
                {invoice.customerSnapshot.deliveryAddress?.city}, {invoice.customerSnapshot.deliveryAddress?.state || 'Bihar'} - {invoice.customerSnapshot.deliveryAddress?.pincode}
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
              {invoice.itemsSnapshot.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.nameSnapshot}</p>
                    <div className="text-[11px] text-slate-500 space-x-1">
                      {item.variant && <span>{item.variant}</span>}
                      {item.addons && item.addons.length > 0 && (
                        <span>• Add-ons: {item.addons.map(a => a.name).join(', ')}</span>
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

        {/* Financial Summary & Totals */}
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

        {/* Footer Notice */}
        <div className="pt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">Thank you for ordering from Flovera!</p>
          <p className="text-[11px]">This is an electronically generated tax invoice. No signature required.</p>
          <p className="text-[11px]">For customer support or queries, reach us at {invoice.restaurantSnapshot.email} or call {invoice.restaurantSnapshot.phone}.</p>
        </div>
      </div>

      {/* Bottom Action Bar (Hidden in Print) */}
      <div className="print:hidden mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order</span>
        </Link>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-all shadow-md shadow-orange-600/20 disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
