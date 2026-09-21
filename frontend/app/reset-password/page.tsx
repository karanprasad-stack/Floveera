'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { score: 0, label: 'Very Weak', color: 'bg-red-400', width: 'w-1/6' };
    }
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!token) {
      setErrorMsg('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await resetPassword({ token, password });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Password reset failed or link has expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-slate-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Invalid Reset Link</h2>
          <p className="text-slate-500 text-sm mb-6">
            This password reset link is missing a security token or has already been used.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl hover:bg-brand-orangeHover transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-[#fbf7f4] to-orange-50/40 py-12 px-4 sm:px-6">
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-white relative"
        >
          <div className="text-center mb-7">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-brand-orange/20 text-brand-orange flex items-center justify-center shadow-md shadow-brand-orange/10 mb-4">
              <Lock className="h-8 w-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Create New Password
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Choose a strong, unique password to secure your Floveera account
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/90 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl mb-5 text-center leading-relaxed"
              role="alert"
            >
              {errorMsg}
            </motion.div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-orange focus:ring-brand-orange rounded-xl transition-all"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Strength:</span>
                      <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300 rounded-full`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-11 pr-11 h-12 bg-slate-50/80 border text-slate-900 placeholder:text-slate-400 focus:bg-white rounded-xl transition-all ${
                      passwordsMatch === false
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-400'
                        : passwordsMatch === true
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-400'
                        : 'border-slate-200 focus:border-brand-orange focus:ring-brand-orange'
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    {passwordsMatch ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || passwordsMatch === false}
                className="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:opacity-95 text-white font-bold h-12 rounded-xl shadow-lg shadow-brand-orange/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Password Changed!</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-brand-orange text-white font-bold h-12 rounded-xl hover:bg-brand-orangeHover transition-all"
              >
                Sign In Now
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
