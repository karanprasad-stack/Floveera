'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import InvoiceView, { InvoiceData } from '@/components/invoice/InvoiceView';
import { getOrderInvoice } from '@/lib/api';
import { AlertCircle, RotateCcw, ArrowLeft, FileText } from 'lucide-react';

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; isNotFound?: boolean; isForbidden?: boolean } | null>(null);

  const fetchInvoice = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderInvoice(orderId);
      setInvoice(data);
    } catch (err: any) {
      console.error('Invoice retrieval error:', err);
      const msg = err?.message || 'Invoice unavailable';
      const is403 = msg.includes('403') || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied');
      const is404 = msg.includes('404') || msg.toLowerCase().includes('not found');
      
      setError({
        message: msg,
        isForbidden: is403,
        isNotFound: is404
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [orderId]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-brand-text font-sans">
        <div className="print:hidden">
          <Navigation />
        </div>

        <main className="flex-1 w-full pb-16">
          {/* Loading Skeleton */}
          {loading && (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm animate-pulse space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <div className="space-y-2">
                    <div className="h-8 bg-slate-200 rounded-lg w-40" />
                    <div className="h-4 bg-slate-100 rounded w-60" />
                  </div>
                  <div className="h-10 bg-slate-200 rounded-xl w-32" />
                </div>
                <div className="h-20 bg-slate-50 rounded-2xl" />
                <div className="h-48 bg-slate-50 rounded-2xl" />
                <div className="h-24 bg-slate-50 rounded-2xl" />
              </div>
            </div>
          )}

          {/* Error / Unavailable States */}
          {!loading && error && (
            <div className="max-w-md mx-auto py-16 px-4 text-center">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>

                {error.isForbidden ? (
                  <>
                    <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
                      Access Denied
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      You do not have permission to view this invoice. You can only view invoices for your own orders.
                    </p>
                    <Link
                      href="/account/orders"
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Go to My Orders</span>
                    </Link>
                  </>
                ) : error.isNotFound ? (
                  <>
                    <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
                      Order Not Found
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      The order or invoice you requested could not be found.
                    </p>
                    <Link
                      href="/account/orders"
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>View My Orders</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
                      Invoice Unavailable
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      We couldn&apos;t generate the invoice for this order yet.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={fetchInvoice}
                        type="button"
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Try Again</span>
                      </button>
                      <Link
                        href="/account/orders"
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
                      >
                        <span>Back to Orders</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Clean Invoice View */}
          {!loading && !error && invoice && (
            <InvoiceView
              invoice={invoice}
              backHref={`/account/orders`}
            />
          )}
        </main>

        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
