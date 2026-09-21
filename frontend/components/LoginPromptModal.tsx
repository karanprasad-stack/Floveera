'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, UserPlus, X, Sparkles, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LoginPromptModal() {
  const pathname = usePathname();
  const { isLoginPromptOpen, loginPromptMessage, closeLoginPrompt } = useAuthStore();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginPrompt();
    };
    if (isLoginPromptOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLoginPromptOpen, closeLoginPrompt]);

  const returnUrl = encodeURIComponent(pathname || '/');

  return (
    <AnimatePresence>
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLoginPrompt}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-prompt-title"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 text-center overflow-hidden z-10"
          >
            {/* Ambient Background Gradient Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={closeLoginPrompt}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Graphic */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white flex items-center justify-center shadow-lg shadow-brand-orange/30 mb-5">
              <ShoppingBag className="w-8 h-8 text-white" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center border-2 border-white shadow-sm">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Title & Message */}
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Login Required</span>
            </span>

            <h3 id="login-prompt-title" className="text-2xl font-display font-black text-gray-900 tracking-tight">
              Please Login to Continue
            </h3>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {loginPromptMessage}
            </p>

            {/* Benefits Checklist */}
            <div className="mt-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-left text-xs text-gray-600 space-y-1.5">
              <p className="flex items-center space-x-2">
                <span className="text-brand-orange font-bold">✓</span>
                <span>Save items to your personal cart</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="text-brand-orange font-bold">✓</span>
                <span>Track live food delivery & supermarket orders</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="text-brand-orange font-bold">✓</span>
                <span>Access member-only discounts and combo bundles</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5">
              <Link
                href={`/login?returnTo=${returnUrl}`}
                onClick={closeLoginPrompt}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:from-brand-orangeHover hover:to-brand-orange active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login to Your Account</span>
              </Link>

              <Link
                href={`/signup?returnTo=${returnUrl}`}
                onClick={closeLoginPrompt}
                className="w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-800 font-semibold text-xs transition-all flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4 text-gray-500" />
                <span>Don&apos;t have an account? Sign Up</span>
              </Link>

              <button
                type="button"
                onClick={closeLoginPrompt}
                className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
