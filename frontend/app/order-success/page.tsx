'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-brand-orange/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] left-[10%] w-64 h-64 bg-brand-green/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative z-10 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="mx-auto w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="h-12 w-12 text-brand-green" />
        </motion.div>

        <h1 className="text-3xl font-bold text-brand-blue mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your order has been received by <span className="font-semibold text-brand-text">Floveera</span> and is being prepared.
        </p>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 space-y-4 text-left border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Clock className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Estimated Delivery</p>
              <p className="font-bold text-brand-text">15 - 20 Minutes</p>
            </div>
          </div>
          
          <div className="h-px bg-gray-200" />
          
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <MapPin className="h-5 w-5 text-brand-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Delivering to</p>
              <p className="font-bold text-brand-text">Your selected location</p>
            </div>
          </div>
        </div>

        <Link 
          href="/"
          className="block w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-md"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
