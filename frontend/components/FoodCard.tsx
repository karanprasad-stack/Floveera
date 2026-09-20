'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface FoodCardProps {
  name: string;
  description?: string;
  price?: number | string;
  unit?: string;
  image?: string;
  index: number;
}

export default function FoodCard({ name, description, price, unit, image, index }: FoodCardProps) {
  const { items, addItem, updateQuantity, toggleCart } = useCartStore();
  const cartItem = items.find((item) => item.name === name);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem({ name, description, price: Number(price) || 0, unit, image });
    // Optional: bounce the cart icon or lightly vibrate mobile
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full relative"
    >
      <div className="h-32 bg-gray-50 overflow-hidden relative">
        <div className="absolute top-2 left-2 bg-brand-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm uppercase tracking-wider">
          Fresh
        </div>
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-sm text-brand-text mb-0.5 line-clamp-1">{name}</h3>
        {description && <p className="text-xs text-brand-text/60 mb-2 line-clamp-1">{description}</p>}
        
        <div className="mt-auto flex justify-between items-end pt-2">
          {price && (
            <div className="flex flex-col">
              <span className="text-brand-orange font-bold text-lg leading-none">
                ₹{price}
              </span>
              {unit && <span className="text-[10px] text-gray-400 mt-0.5">{unit}</span>}
            </div>
          )}
          
          {quantity > 0 ? (
            <div className="flex items-center space-x-2 bg-brand-orange/10 rounded-lg border border-brand-orange/20 shadow-sm px-2 py-1">
              <button
                onClick={() => updateQuantity(name, quantity - 1)}
                className="p-1 hover:bg-white rounded text-brand-orange transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-4 text-center font-bold text-xs text-brand-text">{quantity}</span>
              <button
                onClick={() => updateQuantity(name, quantity + 1)}
                className="p-1 hover:bg-white rounded text-brand-orange transition-colors"
                title="Add another"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAdd}
              className="bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white px-4 py-1.5 rounded-lg hover:shadow-md transition-all flex items-center justify-center space-x-1 font-bold text-sm active:scale-95 border border-transparent"
            >
              <span>ADD</span>
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
