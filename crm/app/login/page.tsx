'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { crmLogin } from '@/lib/api';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { 
  Store, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Clock,
  ExternalLink,
  UserPlus
} from 'lucide-react';

const CUSTOMER_STORE_URL = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || 'http://localhost:3000';

export default function CrmLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const { setUserSession } = useCrmAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCustomerAccountError, setIsCustomerAccountError] = useState(false);
  const [isPendingApprovalError, setIsPendingApprovalError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your email or mobile number and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setIsCustomerAccountError(false);
    setIsPendingApprovalError(false);

    try {
      const res = await crmLogin(identifier.trim(), password);
      if (res && res.restaurant && res.user) {
        setUserSession(
          res.user,
          res.restaurant,
          res.user.restaurantRole === 'RESTAURANT_ADMIN' ? 'RESTAURANT_ADMIN' : 'RESTAURANT_WORKER',
          res.permissions || []
        );
        router.push(returnTo.startsWith('/restaurant') ? returnTo : '/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || 'Invalid mobile/email or password.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('pending') || err?.pendingApproval) {
        setIsPendingApprovalError(true);
      } else if (
        msg.toLowerCase().includes('customer') || 
        msg.toLowerCase().includes('denied') ||
        msg.toLowerCase().includes('does not have access') || 
        msg.toLowerCase().includes('not authorized')
      ) {
        setIsCustomerAccountError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-150">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">FLOVEERA</h1>
            <p className="text-[11px] font-bold tracking-widest text-orange-600 uppercase">Restaurant CRM</p>
          </div>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Welcome back
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Sign in to your restaurant operational workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
          {errorMessage && (
            <div className={`mb-6 p-4 rounded-xl border text-xs flex gap-3 items-start ${
              isPendingApprovalError 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200' 
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300'
            }`}>
              {isPendingApprovalError ? (
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5 flex-1">
                <p className="font-semibold">{errorMessage}</p>
                {isPendingApprovalError && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 pt-1">
                    Your employee account has not yet been approved by the Restaurant Admin. Please contact your administrator to activate your workspace access.
                  </p>
                )}
                {isCustomerAccountError && (
                  <div className="pt-2 border-t border-red-200/60 dark:border-red-800/50">
                    <p className="text-[11px] text-red-600 dark:text-red-400 mb-2">
                      Customer accounts are not authorized to access the Restaurant CRM.
                    </p>
                    <a
                      href={CUSTOMER_STORE_URL}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 underline"
                    >
                      Return to Floveera Customer Store
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email or Mobile Number
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or mobile number"
                  required
                  autoComplete="username"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* New employee registration link - visually secondary */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New employee?{' '}
              <Link
                href="/restaurant/register"
                className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition-colors ml-1"
              >
                Register New Employee
              </Link>
            </p>
          </div>

          {/* Customer store return link */}
          <div className="mt-4 pt-3 border-t border-slate-100/60 dark:border-slate-800/60 text-center">
            <a
              href={CUSTOMER_STORE_URL}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <span>Floveera Customer Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Floveera Operations Portal • Multi-tenant Workspace
        </p>
      </div>
    </div>
  );
}
