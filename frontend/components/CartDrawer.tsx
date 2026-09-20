'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { isCartOpen, items, totalItems, totalPrice, toggleCart, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    toggleCart(false);
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b bg-brand-blue text-white">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-brand-orange" />
                <h2 className="text-lg font-bold">Your Cart ({totalItems})</h2>
              </div>
              <button
                onClick={() => toggleCart(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <ShoppingBag className="h-16 w-16 text-gray-300" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-text text-sm mb-1">{item.name}</h4>
                      <div className="text-brand-orange font-bold text-sm">₹{item.price} {item.unit && <span className="text-gray-500 text-xs font-normal">{item.unit}</span>}</div>
                    </div>

                    <div className="flex items-center space-x-2 bg-white rounded-lg border shadow-sm px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-medium text-sm text-brand-text">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded text-brand-orange transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 bg-gray-50 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center mb-4 text-brand-text">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-lg">₹{totalPrice}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
