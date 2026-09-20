'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function FloatingCart() {
  const { totalItems, totalPrice, toggleCart, isCartOpen } = useCartStore();

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      {!isCartOpen && (
        <motion.button
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => toggleCart(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-3 hover:scale-105 active:scale-95 transition-transform border border-white/20"
        >
          <div className="relative">
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-brand-blue text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-md">
              {totalItems}
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs text-white/80 font-medium">Total</p>
            <p className="text-sm font-bold">₹{totalPrice}</p>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
