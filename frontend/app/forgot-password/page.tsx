'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, handle password reset email sending here
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#F3F4F6]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-full h-full bg-brand-blue/10 blur-[120px] rounded-full mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-full h-full bg-brand-green/10 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-full h-full bg-brand-orange/10 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden"
        >
          <button 
             onClick={() => router.back()}
             className="absolute top-6 left-6 text-gray-500 hover:text-brand-orange transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 z-10"
             aria-label="Go back"
          >
             <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-green to-brand-blue mb-4 shadow-lg shadow-brand-green/30"
            >
              <KeyRound className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-brand-text mb-2">Reset Password</h1>
            <p className="text-gray-500">
              {isSubmitted 
                ? "Check your email for reset instructions" 
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-green transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 text-brand-text placeholder:text-gray-400 focus:bg-white focus:border-brand-green transition-all focus:ring-1 focus:ring-brand-green outline-none"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green hover:to-brand-blue text-white border-0 shadow-lg shadow-brand-green/30 group py-6 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Send Link
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
               <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full bg-gray-50 border-gray-200 text-brand-text hover:bg-gray-100 mt-4 group py-6 text-lg rounded-xl transition-all"
              >
                Try another email
              </Button>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center text-gray-500 hover:text-brand-text transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
