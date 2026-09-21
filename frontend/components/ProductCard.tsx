'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Package, Check, Star } from 'lucide-react';
import { useCartStore, generateCartItemId } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export interface ProductUnit {
  label: string;
  price: number;
  originalPrice?: number;
}

export interface ProductCardProps {
  _id?: string;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  unit?: string;
  image?: string;
  imageUrl?: string;
  index?: number;
  badge?: string;
  rating?: number;
  units?: ProductUnit[];
}

export default function ProductCard({
  _id,
  name,
  description,
  price,
  originalPrice,
  unit,
  image,
  imageUrl,
  index = 0,
  badge = 'In Stock',
  rating = 4.8,
  units,
}: ProductCardProps) {
  const { user, openLoginPrompt } = useAuthStore();
  const { items, addItem, updateQuantity } = useCartStore();

  const [activeUnit, setActiveUnit] = useState<string>(
    units && units.length > 0 ? units[0].label : (unit || '')
  );
  const activeUnitObj = units?.find((u) => u.label === activeUnit);
  const currentPrice = activeUnitObj ? activeUnitObj.price : Number(price) || 0;
  const currentOriginalPrice = activeUnitObj ? activeUnitObj.originalPrice : originalPrice;

  const imgSrc = imageUrl || image || '';
  const cartItemId = generateCartItemId(_id || name, activeUnit, { selectedUnit: activeUnit });
  const cartItem = items.find((item) => item.id === cartItemId);
  const quantity = cartItem?.quantity || 0;

  const discountPercent =
    currentOriginalPrice && currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : null;

  const handleAdd = () => {
    if (!user) {
      openLoginPrompt('You need to login first to add items to your cart.');
      return;
    }
    addItem({
      productId: _id,
      name,
      description,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      unit: activeUnit,
      image: imgSrc,
      vertical: 'supermart',
      customization: { selectedUnit: activeUnit },
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="bg-white rounded-2xl shadow-card hover:shadow-cardHover border border-gray-100 transition-all duration-300 overflow-hidden group flex flex-col h-full relative"
    >
      {/* Thumbnail */}
      <div className="h-36 sm:h-44 w-full bg-gray-50 overflow-hidden relative">
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent && (
            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {badge && !discountPercent && (
            <span className="bg-brand-blue/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>

        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            <Package className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3.5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-display font-bold text-sm text-brand-text line-clamp-1 group-hover:text-brand-orange transition-colors">
            {name}
          </h3>
        </div>

        {description && (
          <p className="text-xs text-gray-500 mb-2.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Unit Selector Pills (kg, pack, piece) */}
        {units && units.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {units.map((u) => (
              <button
                key={u.label}
                type="button"
                onClick={() => setActiveUnit(u.label)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                  activeUnit === u.label
                    ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        )}

        {/* Price & Add to Cart button */}
        <div className="mt-auto flex justify-between items-end pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-brand-orange font-extrabold text-base sm:text-lg leading-none">
                ₹{currentPrice}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{currentOriginalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 font-medium">
              {activeUnit || unit}
            </span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center space-x-1.5 bg-orange-50 border border-brand-orange/30 rounded-xl px-2 py-1 shadow-sm">
              <button
                onClick={() => updateQuantity(cartItemId, quantity - 1)}
                className="w-5 h-5 flex items-center justify-center rounded text-brand-orange hover:bg-white active:scale-90 transition-all"
                aria-label={`Decrease quantity of ${name}`}
              >
                <Minus className="h-3 w-3" aria-hidden="true" />
              </button>
              <span
                className="w-4 text-center font-black text-xs text-brand-text"
                aria-label={`Current quantity: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItemId, quantity + 1)}
                className="w-5 h-5 flex items-center justify-center rounded text-brand-orange hover:bg-white active:scale-90 transition-all"
                title="Add another"
                aria-label={`Increase quantity of ${name}`}
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white px-3.5 py-1.5 rounded-xl hover:shadow-glowOrange active:scale-95 transition-all duration-150 flex items-center justify-center space-x-1 font-bold text-xs shadow-sm"
              aria-label={`Add ${name} to cart`}
            >
              <span>ADD</span>
              <Plus className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
