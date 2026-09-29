'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerRestaurantWorker } from '@/lib/api';
import {
  Store,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

const CUSTOMER_STORE_URL = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || 'http://localhost:3000';

export default function RestaurantRegisterPage() {
  const router = useRouter();

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    status: string;
    autoApproved: boolean;
    name: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Client-Side Validation (UX)
    if (!name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^\d+]/g, '');
    if (cleanPhone.replace(/[^\d]/g, '').length < 10) {
      setErrorMessage('Please enter a valid mobile number (at least 10 digits).');
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerRestaurantWorker({
        name: name.trim(),
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        phone: phone.trim(),
        password,
        confirmPassword
      });

      setSuccessData({
        status: res.status,
        autoApproved: !!res.autoApproved,
        name: res.user?.name || name
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS STATE VIEW
  if (successData) {
    const isPending = !successData.autoApproved || successData.status === 'PENDING';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-150">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Brand Header */}
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">FLOVEERA</h1>
              <p className="text-[11px] font-bold tracking-widest text-orange-600 uppercase">Restaurant CRM</p>
            </div>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-xs">
              {isPending ? (
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Clock className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {isPending ? 'Account Created' : 'Registration Successful'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {isPending
                  ? 'Your employee account has been created and is waiting for Restaurant Admin approval. You will be able to access the Restaurant CRM once approved.'
                  : 'Your employee account has been created. You can now sign in to your restaurant operational workspace.'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors"
              >
                <span>{isPending ? 'Back to Login' : 'Go to Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 transition-colors duration-150">
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
          Register New Employee
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Create your employee account to access Restaurant CRM
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="font-semibold text-red-800 dark:text-red-300 flex-1">{errorMessage}</p>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Full Name * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="block w-full pl-10 pr-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Mobile Number * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your mobile number"
                  required
                  className="block w-full pl-10 pr-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional"
                  className="block w-full pl-10 pr-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Email is optional. You can use your mobile number to sign in.
              </p>
            </div>

            {/* Password * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="block w-full pl-10 pr-10 py-2 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password * */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="block w-full pl-10 pr-10 py-2 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Employee Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Employee Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition-colors ml-1"
              >
                Back to Login
              </Link>
            </p>
          </div>

          {/* Customer store return link */}
          <div className="mt-3 pt-3 border-t border-slate-100/60 dark:border-slate-800/60 text-center">
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
          Floveera Operations Portal • Staff Registration Verification
        </p>
      </div>
    </div>
  );
}
