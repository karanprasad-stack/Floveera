'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Utensils,
  Store,
  Cake,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    deliveryFee,
    taxes,
    grandTotal,
  } = useCartStore();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        toggleCart(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, toggleCart]);

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isCartOpen]);

  const freeDeliveryThreshold = 299;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalPrice);
  const freeDeliveryProgress = Math.min(100, (totalPrice / freeDeliveryThreshold) * 100);

  const getVerticalBadge = (vertical: string) => {
    switch (vertical) {
      case 'restaurant':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-brand-orange border border-brand-orange/20">
            <Utensils className="w-2.5 h-2.5" /> Restaurant
          </span>
        );
      case 'cakes':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200">
            <Cake className="w-2.5 h-2.5" /> Bakery
          </span>
        );
      case 'supermart':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Store className="w-2.5 h-2.5" /> Supermart
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => toggleCart(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Slide-over */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-drawer-heading"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100/70 text-brand-orange flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 id="cart-drawer-heading" className="text-base sm:text-lg font-bold text-gray-900 font-display">
                      Your Order Cart
                    </h2>
                    <p className="text-xs text-gray-500">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'} in total
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {items.length > 0 && (
                    <button
                      onClick={() => clearCart()}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Clear Cart"
                      aria-label="Clear all items from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleCart(false)}
                    className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
                    aria-label="Close cart drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Free Delivery Bar */}
              {items.length > 0 && (
                <div className="px-4 py-2.5 bg-orange-50/60 border-b border-orange-100/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-gray-700">
                      <Truck className="w-3.5 h-3.5 text-brand-orange" />
                      {amountNeededForFreeDelivery === 0 ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> FREE Delivery Unlocked!
                        </span>
                      ) : (
                        <span>
                          Add <span className="font-bold text-brand-orange">₹{amountNeededForFreeDelivery}</span> more for FREE delivery
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-semibold">Min. ₹299</span>
                  </div>
                  <div className="w-full h-1.5 bg-orange-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-orange to-brand-orangeHover transition-all duration-300 rounded-full"
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Drawer Content / Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-brand-orange/50 shadow-inner">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 font-display">Your cart is empty</h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        Looks like you haven&apos;t added any food, cakes, or groceries yet. Start browsing below!
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCart(false)}
                      className="mt-2 bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-brand-orange/20 active:scale-95 transition-all"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const hasCustomization =
                      item.customization &&
                      (item.customization.spiceLevel ||
                        (item.customization.addOns && item.customization.addOns.length > 0) ||
                        item.customization.cakeMessage ||
                        item.customization.weight ||
                        item.customization.deliverySlot ||
                        item.customization.isEggless ||
                        item.customization.notes);

                    return (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5"
                      >
                        <div className="flex items-start gap-3">
                          {/* Item Image */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              {getVerticalBadge(item.vertical)}
                              {item.unit && (
                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {item.unit}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-gray-900 truncate leading-snug">
                              {item.name}
                            </h4>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-extrabold text-brand-orange">
                                ₹{item.price * item.quantity}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-xs text-gray-400">
                                  (₹{item.price} each)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden p-0.5 flex-shrink-0">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white rounded-lg transition-colors active:scale-95"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white rounded-lg transition-colors active:scale-95"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Customization Details Pills */}
                        {hasCustomization && (
                          <div className="bg-gray-50/80 rounded-xl p-2.5 text-[11px] text-gray-600 space-y-1 border border-gray-100">
                            {item.customization?.spiceLevel && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Spice:</span>
                                <span className="font-semibold text-gray-700">{item.customization.spiceLevel}</span>
                              </div>
                            )}
                            {item.customization?.addOns && item.customization.addOns.length > 0 && (
                              <div className="flex items-start justify-between">
                                <span className="text-gray-400">Add-ons:</span>
                                <span className="font-semibold text-gray-700 text-right">
                                  {item.customization.addOns.map((a) => `${a.name} (+₹${a.price})`).join(', ')}
                                </span>
                              </div>
                            )}
                            {item.customization?.weight && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Size/Weight:</span>
                                <span className="font-semibold text-gray-700">{item.customization.weight}</span>
                              </div>
                            )}
                            {item.customization?.isEggless !== undefined && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Dietary:</span>
                                <span className="font-semibold text-emerald-700">
                                  {item.customization.isEggless ? '🌱 100% Eggless' : 'Regular'}
                                </span>
                              </div>
                            )}
                            {item.customization?.cakeMessage && (
                              <div className="flex items-start justify-between">
                                <span className="text-gray-400">Message:</span>
                                <span className="font-semibold italic text-brand-text">
                                  &ldquo;{item.customization.cakeMessage}&rdquo;
                                </span>
                              </div>
                            )}
                            {item.customization?.deliveryDate && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Delivery:</span>
                                <span className="font-semibold text-brand-orange">
                                  {item.customization.deliveryDate} {item.customization.deliverySlot || ''}
                                </span>
                              </div>
                            )}
                            {item.customization?.notes && (
                              <div className="flex items-start justify-between">
                                <span className="text-gray-400">Note:</span>
                                <span className="font-medium text-gray-600">{item.customization.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3.5 shadow-lg">
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Item Total</span>
                      <span className="font-semibold text-gray-800">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      {deliveryFee === 0 ? (
                        <span className="font-bold text-emerald-600 uppercase tracking-wider">FREE</span>
                      ) : (
                        <span className="font-semibold text-gray-800">₹{deliveryFee}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Packaging (5% GST)</span>
                      <span className="font-semibold text-gray-800">₹{taxes}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm">
                      <span className="font-bold text-gray-900">Grand Total</span>
                      <span className="text-lg font-black text-brand-orange">₹{grandTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleCart(false);
                      router.push('/checkout');
                    }}
                    className="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:opacity-95 text-white py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-brand-orange/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
