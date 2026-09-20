'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const userData = await loginUser({ email, password });
      setUser(userData);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#F3F4F6]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-brand-blue/10 blur-[120px] rounded-full mix-blend-screen animate-blob"></div>
        <div className="absolute top-0 -right-1/4 w-full h-full bg-brand-orange/10 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/2 left-1/4 w-full h-full bg-brand-green/10 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-brand-orange to-brand-blue mb-4 shadow-lg shadow-brand-orange/30"
            >
              <LogIn className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-brand-text mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue to Floveera</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 text-brand-text placeholder:text-gray-400 focus:bg-white focus:border-brand-orange transition-all focus:ring-1 focus:ring-brand-orange outline-none"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 text-brand-text placeholder:text-gray-400 focus:bg-white focus:border-brand-orange transition-all focus:ring-1 focus:ring-brand-orange outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 bg-gray-50 text-brand-orange focus:ring-brand-orange" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-brand-orange hover:text-brand-orangeHover transition-colors">
                Forgot password?
              </Link>
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-brand-orange to-brand-blue hover:from-brand-orangeHover hover:to-brand-blue text-white border-0 shadow-lg shadow-brand-blue/30 group py-6 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-orange font-medium hover:text-brand-orangeHover transition-colors">
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
