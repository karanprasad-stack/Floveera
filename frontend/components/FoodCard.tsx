'use client';

import { motion } from 'framer-motion';
import { Plus, Minus, Star, Flame, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export interface FoodCardItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  unit?: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  dietary?: 'veg' | 'non-veg' | 'eggless' | 'none';
  rating?: number;
  ratingCount?: number;
  isBestseller?: boolean;
  isSpecial?: boolean;
  isAvailable?: boolean;
  stock?: number;
  estimatedDeliveryMins?: string;
  units?: Array<{ label: string; price: number; originalPrice?: number }>;
  customizationOptions?: {
    spiceLevels?: string[];
    addOns?: Array<{ name: string; price: number }>;
    flavors?: string[];
  };
}

export interface FoodCardProps extends FoodCardItem {
  index: number;
  onCustomize?: (item: FoodCardItem) => void;
}

export default function FoodCard({
  _id,
  name,
  description,
  price,
  originalPrice,
  unit,
  image,
  imageUrl,
  category,
  dietary = 'veg',
  rating = 4.8,
  ratingCount = 42,
  isBestseller,
  isSpecial,
  isAvailable = true,
  stock,
  estimatedDeliveryMins = '25-30 mins',
  units,
  customizationOptions,
  index,
  onCustomize,
}: FoodCardProps) {
  const { user, openLoginPrompt } = useAuthStore();
  const { items, addItem, updateQuantity, toggleCart } = useCartStore();

  const isOutOfStock = isAvailable === false || (typeof stock === 'number' && stock <= 0);

  // Look for items matching this product in cart
  const cartItems = items.filter((item) => {
    if (_id && item.productId) {
      return item.productId === _id;
    }
    return Boolean(name && item.name && item.name.toLowerCase() === name.toLowerCase());
  });
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const resolveImage = (url?: string) => {
    if (!url) return '/images/pizza.jpg';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads')) {
      const backendOrigin = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http'))
        ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
        : 'http://localhost:5000';
      return `${backendOrigin}${url}`;
    }
    return url;
  };

  const imgSrc = resolveImage(imageUrl || image);
  const hasOptions = (units && units.length > 1) || (customizationOptions?.addOns && customizationOptions.addOns.length > 0);

  const handleAction = () => {
    if (isOutOfStock) return;
    if (!user) {
      openLoginPrompt('You need to login first to add items to your cart.');
      return;
    }
    if (onCustomize) {
      onCustomize({
        _id,
        name,
        description,
        price,
        originalPrice,
        unit,
        image: imgSrc,
        imageUrl: imgSrc,
        category,
        dietary,
        rating,
        units,
        customizationOptions,
        isAvailable,
        stock,
        isSpecial,
        isBestseller
      });
    } else {
      addItem({
        productId: _id || name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description,
        price,
        originalPrice,
        image: imgSrc,
        vertical: 'restaurant',
        unit,
      });
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className={`bg-white rounded-2xl shadow-card hover:shadow-cardHover border transition-all duration-300 overflow-hidden group flex flex-col h-full relative ${
        isOutOfStock ? 'border-gray-200 opacity-80' : 'border-gray-100/90'
      }`}
    >
      {/* Image Thumbnail & Badges */}
      <div className="h-36 sm:h-40 bg-gray-100 overflow-hidden relative">
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/pizza.jpg';
          }}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale contrast-75' : 'group-hover:scale-105'
          }`}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md border border-rose-400/40">
              Out of Stock
            </span>
          </div>
        )}

        {/* Dietary symbol & Special/Bestseller Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap">
          {dietary === 'veg' || dietary === 'eggless' ? (
            <div className="w-4 h-4 rounded-sm border border-emerald-600 bg-white flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-sm border border-red-600 bg-white flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 rounded-full bg-red-600" />
            </div>
          )}

          {isSpecial && (
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 fill-current" /> Chef Special
            </span>
          )}

          {isBestseller && !isSpecial && (
            <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-current" /> Bestseller
            </span>
          )}
        </div>

        {/* Delivery Time Badge */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span>⚡ {estimatedDeliveryMins}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-display font-bold text-sm sm:text-base text-gray-900 line-clamp-1 group-hover:text-brand-orange transition-colors">
            {name}
          </h3>
          <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0">
            <Star className="w-3 h-3 fill-emerald-600 text-emerald-600 mr-0.5" />
            <span>{rating}</span>
          </div>
        </div>

        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Price & Action Button */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-brand-orange text-base sm:text-lg leading-none">
                ₹{price}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            {unit && <span className="text-[10px] text-gray-400 mt-0.5">{unit}</span>}
          </div>

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="bg-gray-100 text-gray-400 font-bold text-xs px-3 py-1.5 rounded-xl cursor-not-allowed select-none border border-gray-200"
            >
              OUT OF STOCK
            </button>
          ) : totalQuantity > 0 ? (
            <div className="flex items-center space-x-1.5 bg-orange-50 border border-brand-orange/30 rounded-xl px-2 py-1 shadow-sm">
              <button
                onClick={() => {
                  const firstMatchingItem = cartItems[0];
                  if (firstMatchingItem) {
                    updateQuantity(firstMatchingItem.id, firstMatchingItem.quantity - 1);
                  }
                }}
                className="w-5 h-5 flex items-center justify-center rounded text-brand-orange hover:bg-white active:scale-90 transition-all"
                aria-label={`Decrease quantity of ${name}`}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-4 text-center font-black text-xs text-brand-text">
                {totalQuantity}
              </span>
              <button
                onClick={() => {
                  if (hasOptions && onCustomize) {
                    handleAction();
                  } else {
                    const firstMatchingItem = cartItems[0];
                    if (firstMatchingItem) {
                      updateQuantity(firstMatchingItem.id, firstMatchingItem.quantity + 1);
                    } else {
                      handleAction();
                    }
                  }
                }}
                className="w-5 h-5 flex items-center justify-center rounded text-brand-orange hover:bg-white active:scale-90 transition-all"
                aria-label={`Increase quantity of ${name}`}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              className="bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:opacity-95 text-white px-3.5 py-1.5 rounded-xl active:scale-95 transition-all duration-150 flex items-center justify-center space-x-1 font-bold text-xs shadow-sm shadow-brand-orange/20"
            >
              <span>{hasOptions ? 'CUSTOMIZE' : 'ADD'}</span>
              <Plus className="h-3 w-3 ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
