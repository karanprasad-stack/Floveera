'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Clock, FileText, Download, Navigation as TrackIcon, Home } from 'lucide-react';
import Link from 'next/link';
import { downloadInvoicePdf } from '@/lib/api';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadInvoice = async () => {
    const targetId = orderNumber || orderId;
    if (!targetId) return;

    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadInvoicePdf(targetId, `Flovera-Invoice-${orderNumber || targetId}.pdf`);
    } catch (err: any) {
      console.error('Download invoice error:', err);
      setDownloadError(err?.message || 'Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const hasSuccessfulOrder = Boolean(orderId || orderNumber);
  const invoiceTarget = orderNumber || orderId;

  return (
    <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-brand-orange/25 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] left-[10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-9 shadow-2xl relative z-10 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-5"
        >
          <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue mb-1.5 font-display">
          Order Confirmed!
        </h1>
        
        <p className="text-gray-500 text-xs sm:text-sm mb-2">
          Thank you for your order.
        </p>

        {hasSuccessfulOrder && (
          <div className="inline-block bg-orange-50 border border-orange-200/80 px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs sm:text-sm font-bold font-mono text-brand-orange">
              Order #{orderNumber || orderId}
            </span>
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 mb-6 space-y-3.5 text-left border border-gray-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xs flex-shrink-0">
              <Clock className="h-4 w-4 text-brand-orange" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Estimated Delivery</p>
              <p className="font-bold text-xs sm:text-sm text-brand-text">25 - 35 Minutes</p>
            </div>
          </div>
          
          <div className="h-px bg-gray-200/80" />
          
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xs flex-shrink-0">
              <MapPin className="h-4 w-4 text-brand-blue" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Delivering to</p>
              <p className="font-bold text-xs sm:text-sm text-brand-text">Your selected address</p>
            </div>
          </div>
        </div>

        {downloadError && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
            {downloadError}
          </p>
        )}

        {/* Action Buttons Section */}
        {hasSuccessfulOrder ? (
          <div className="space-y-3">
            {/* Primary Action: Track Order */}
            <Link 
              href={`/account/orders/${orderId || orderNumber}`}
              className="flex items-center justify-center space-x-2 w-full bg-brand-blue text-white py-3.5 px-4 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-sm"
            >
              <TrackIcon className="w-4 h-4" />
              <span>Track Order</span>
            </Link>

            {/* Invoice Actions Row / Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Secondary: View Invoice */}
              <Link 
                href={`/orders/${invoiceTarget}/invoice`}
                className="flex items-center justify-center space-x-2 w-full bg-orange-50 hover:bg-orange-100 text-brand-orange border border-orange-200 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-colors"
              >
                <FileText className="w-4 h-4 text-brand-orange" />
                <span>View Invoice</span>
              </Link>

              {/* Clear Download Action */}
              <button 
                type="button"
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="flex items-center justify-center space-x-2 w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-2xs disabled:opacity-60"
              >
                <Download className={`w-4 h-4 text-brand-orange ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Downloading...' : 'Download Invoice'}</span>
              </button>
            </div>

            <Link 
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gray-600 font-semibold pt-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-md text-sm"
            >
              Back to Home
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-blue flex items-center justify-center text-white">
        <p className="font-semibold text-sm">Loading order confirmation...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
