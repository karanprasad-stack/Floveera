'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Flame,
  Check,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore, CartCustomization } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export interface CustomizerProduct {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  image?: string;
  vertical: 'restaurant' | 'supermart' | 'cakes';
  dietary?: 'veg' | 'non-veg' | 'eggless' | 'none';
  units?: Array<{ label: string; price: number; originalPrice?: number }>;
  customizationOptions?: {
    spiceLevels?: string[];
    addOns?: Array<{ name: string; price: number }>;
    flavors?: string[];
  };
}

interface ItemCustomizerModalProps {
  product: CustomizerProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemCustomizerModal({
  product,
  isOpen,
  onClose,
}: ItemCustomizerModalProps) {
  const { addItem, toggleCart } = useCartStore();

  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // Restaurant customization
  const [spiceLevel, setSpiceLevel] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ name: string; price: number }>>([]);
  const [cookingNotes, setCookingNotes] = useState<string>('');

  // Cakes customization
  const [cakeWeight, setCakeWeight] = useState<string>('500g');
  const [cakeFlavor, setCakeFlavor] = useState<string>('');
  const [isEggless, setIsEggless] = useState<boolean>(true);
  const [cakeMessage, setCakeMessage] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('Today');
  const [deliverySlot, setDeliverySlot] = useState<string>('4:00 PM - 7:00 PM');

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCookingNotes('');
      setCakeMessage('');
      setSelectedAddOns([]);

      // Initialize base price and unit
      if (product.units && product.units.length > 0) {
        setSelectedUnit(product.units[0].label);
        setBasePrice(product.units[0].price);
      } else {
        setSelectedUnit('');
        setBasePrice(product.price || 0);
      }

      // Initialize spice level
      if (product.customizationOptions?.spiceLevels && product.customizationOptions.spiceLevels.length > 0) {
        setSpiceLevel(product.customizationOptions.spiceLevels[0]);
      } else {
        setSpiceLevel(product.vertical === 'restaurant' ? 'Medium' : '');
      }

      // Initialize flavor
      if (product.customizationOptions?.flavors && product.customizationOptions.flavors.length > 0) {
        setCakeFlavor(product.customizationOptions.flavors[0]);
      } else {
        setCakeFlavor('');
      }

      // Default cake settings
      if (product.vertical === 'cakes') {
        setIsEggless(product.dietary === 'eggless');
        setCakeWeight('500g');
      }
    }
  }, [product]);

  if (!product) return null;

  const handleUnitChange = (unitObj: { label: string; price: number }) => {
    setSelectedUnit(unitObj.label);
    setBasePrice(unitObj.price);
  };

  const toggleAddOn = (addon: { name: string; price: number }) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      if (exists) {
        return prev.filter((a) => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = basePrice + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      onClose();
      useAuthStore.getState().openLoginPrompt('You need to login first to add items to your cart.');
      return;
    }

    const customization: CartCustomization = {};

    if (product.vertical === 'restaurant') {
      if (spiceLevel) customization.spiceLevel = spiceLevel;
      if (selectedAddOns.length > 0) customization.addOns = selectedAddOns;
      if (cookingNotes.trim()) customization.notes = cookingNotes.trim();
    } else if (product.vertical === 'cakes') {
      customization.weight = cakeWeight || selectedUnit || '500g';
      if (cakeFlavor) customization.flavor = cakeFlavor;
      customization.isEggless = isEggless;
      if (cakeMessage.trim()) customization.cakeMessage = cakeMessage.trim();
      customization.deliveryDate = deliveryDate;
      customization.deliverySlot = deliverySlot;
    } else if (product.vertical === 'supermart') {
      customization.selectedUnit = selectedUnit;
    }

    addItem({
      productId: product._id || product.name,
      name: product.name,
      price: basePrice, // addItem automatically adds add-ons
      originalPrice: product.originalPrice,
      image: product.imageUrl || product.image,
      vertical: product.vertical,
      unit: selectedUnit,
      description: product.description,
      customization,
      quantity,
    });

    onClose();
    toggleCart(true); // Open the slide-over drawer to show immediate feedback
  };

  const imgSrc = product.imageUrl || product.image || '/images/pizza.jpg';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]"
            >
              {/* Header with image preview */}
              <div className="relative h-44 sm:h-48 bg-slate-900 overflow-hidden flex-shrink-0">
                <Image
                  src={imgSrc}
                  alt={product.name}
                  fill
                  className="object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md active:scale-95 transition-all z-10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    {product.dietary === 'veg' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-sm">
                        🌱 Pure Veg
                      </span>
                    )}
                    {product.dietary === 'eggless' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600/90 text-white shadow-sm">
                        🌱 100% Eggless
                      </span>
                    )}
                    {product.dietary === 'non-veg' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/90 text-white shadow-sm">
                        Non-Veg
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display leading-tight truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Scrollable Customization Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Variant / Unit selection (e.g. Regular 7" vs Medium 9", or 500g vs 1kg) */}
                {product.units && product.units.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Select Size / Quantity Variant
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.units.map((unitObj) => {
                        const isSelected = selectedUnit === unitObj.label;
                        return (
                          <button
                            key={unitObj.label}
                            type="button"
                            onClick={() => handleUnitChange(unitObj)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all duration-150 ${
                              isSelected
                                ? 'border-brand-orange bg-orange-50/70 text-brand-text ring-1 ring-brand-orange font-bold'
                                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span>{unitObj.label}</span>
                            <span className="font-extrabold text-brand-orange">
                              ₹{unitObj.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RESTAURANT SPECIFIC: Spice Level */}
                {product.vertical === 'restaurant' &&
                  product.customizationOptions?.spiceLevels &&
                  product.customizationOptions.spiceLevels.length > 0 && (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        Choose Spice Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {product.customizationOptions.spiceLevels.map((level) => {
                          const isSelected = spiceLevel === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setSpiceLevel(level)}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                                isSelected
                                  ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange font-bold'
                                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* RESTAURANT SPECIFIC: Add-ons */}
                {product.vertical === 'restaurant' &&
                  product.customizationOptions?.addOns &&
                  product.customizationOptions.addOns.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Extra Add-ons & Dips (Optional)
                      </label>
                      <div className="space-y-2">
                        {product.customizationOptions.addOns.map((addon) => {
                          const isSelected = selectedAddOns.some((a) => a.name === addon.name);
                          return (
                            <button
                              key={addon.name}
                              type="button"
                              onClick={() => toggleAddOn(addon)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                                isSelected
                                  ? 'border-brand-orange bg-orange-50/50 text-brand-text'
                                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-brand-orange border-brand-orange text-white'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="font-medium text-xs sm:text-sm">{addon.name}</span>
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-brand-orange">
                                +₹{addon.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* RESTAURANT SPECIFIC: Cooking Instructions */}
                {product.vertical === 'restaurant' && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      Cooking Instructions / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Less spicy, crispy, extra napkins"
                      value={cookingNotes}
                      onChange={(e) => setCookingNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm text-gray-800 placeholder:text-gray-400"
                      maxLength={100}
                    />
                  </div>
                )}

                {/* CAKES SPECIFIC: Eggless Toggle & Message on Cake */}
                {product.vertical === 'cakes' && (
                  <div className="space-y-4">
                    {/* Eggless option */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/70">
                      <div>
                        <p className="text-xs font-bold text-gray-800">100% Pure Vegetarian / Eggless</p>
                        <p className="text-[11px] text-gray-500">Baked in dedicated vegetarian oven facility</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEggless(!isEggless)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          isEggless ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            isEggless ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Inscription on Cake */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                        Custom Message on Cake (Free)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Happy Birthday Priya!"
                        value={cakeMessage}
                        onChange={(e) => setCakeMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm text-gray-800 placeholder:text-gray-400"
                        maxLength={35}
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Max 35 characters piped in rich chocolate/cream</span>
                    </div>

                    {/* Delivery Slot Scheduling */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          Delivery Date
                        </label>
                        <select
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:border-brand-orange outline-none"
                        >
                          <option value="Today">Today</option>
                          <option value="Tomorrow">Tomorrow</option>
                          <option value="Day After Tomorrow">Day After Tomorrow</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          Time Window
                        </label>
                        <select
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:border-brand-orange outline-none"
                        >
                          <option value="10:00 AM - 1:00 PM">Morning (10AM - 1PM)</option>
                          <option value="2:00 PM - 5:00 PM">Afternoon (2PM - 5PM)</option>
                          <option value="5:00 PM - 8:00 PM">Evening (5PM - 8PM)</option>
                          <option value="11:30 PM Midnight">Midnight Surprise (11:30PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with quantity & dynamic Add to Cart */}
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white rounded-lg transition-colors active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white rounded-lg transition-colors active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:opacity-95 text-white py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-brand-orange/25 active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" /> Add Item
                  </span>
                  <span className="font-extrabold text-white">₹{totalPrice}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
