'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestPasswordReset } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-[#fbf7f4] to-orange-50/40 py-12 px-4 sm:px-6">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-white relative"
        >
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center mb-7">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-brand-orange/20 text-brand-orange flex items-center justify-center shadow-md shadow-brand-orange/10 mb-4">
              <KeyRound className="h-8 w-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Reset Password
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              {isSubmitted
                ? 'Check your email inbox for the reset link'
                : "Enter your account's email address and we will send you a link to reset your password"}
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

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-orange focus:ring-brand-orange rounded-xl transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:opacity-95 text-white font-bold h-12 rounded-xl shadow-lg shadow-brand-orange/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  If an account exists for <span className="font-semibold">{email}</span>, a password reset link has been dispatched. For local development, check your backend terminal logs.
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold h-12 rounded-xl"
              >
                Try another email
              </Button>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-sm font-semibold text-slate-500 hover:text-brand-orange transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
