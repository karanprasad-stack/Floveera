'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCrmAuthStore, CrmRole } from '@/store/crmAuthStore';
import { Loader2, ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import Link from 'next/link';
import CrmSidebar from './CrmSidebar';

interface CrmGuardProps {
  children: React.ReactNode;
  allowedRoles?: CrmRole[];
}

export default function CrmGuard({ children, allowedRoles }: CrmGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, restaurant, role, isLoading, hasCheckedAuth, checkCrmAuth, logout } = useCrmAuthStore();
  const [denialReason, setDenialReason] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      const session = await checkCrmAuth();
      if (!session) {
        router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
        return;
      }

      if (allowedRoles && !allowedRoles.includes(session.role)) {
        setDenialReason(`This module requires ${allowedRoles.join(' or ')} permissions.`);
      } else {
        setDenialReason(null);
      }
    }

    verify();
  }, [pathname, checkCrmAuth, router]);

  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
          Verifying Restaurant CRM Session...
        </p>
      </div>
    );
  }

  // Not logged in or customer account with no CRM access
  if (!user || !role) {
    const customerUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 'http://localhost:3000';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center text-slate-900 dark:text-slate-100 transition-colors">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-8 max-w-md w-full">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/50">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Your account does not have access to Restaurant CRM. Only authorized restaurant administrators and workers can access operations.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <span>Sign In with CRM Credentials</span>
            </Link>
            <a
              href={customerUrl}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Floveera Customer Store</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Role insufficient (e.g. Worker visiting /inventory or /revenue)
  if (denialReason) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center text-slate-900 dark:text-slate-100 transition-colors">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-8 max-w-md w-full">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900/50">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">
            Access Restricted (403)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {denialReason}
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <span>Return to Worker Dashboard</span>
            </Link>
            <button
              onClick={() => logout().then(() => router.replace('/login'))}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <CrmSidebar />
      <div className="md:pl-60 flex flex-col min-w-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
