'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import {
  Store,
  Sparkles,
  Search,
  ShoppingCart,
  CheckCircle2,
  Tag,
  Package,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { getProducts } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const DEFAULT_BANNER = [
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=80',
];

export default function SupermartPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem, toggleCart } = useCartStore();

  // Banner slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_BANNER.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Fetch Supermart items from API with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadSupermartItems() {
      try {
        setIsLoading(true);
        const data = await getProducts({ vertical: 'supermart' });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Using local fallback for supermart catalog');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSupermartItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const supermartAisles = [
    { id: 'all', name: 'All Aisles' },
    { id: 'fmcg', name: 'FMCG & Groceries' },
    { id: 'household', name: 'Household Cleaning' },
    { id: 'kitchenware', name: 'Kitchenware & Cookware' },
    { id: 'tailoring', name: 'Tailoring & Threads' },
    { id: 'gifts', name: 'Jewellery & Gifts' },
    { id: 'electronics', name: 'Electronics & Mobile' },
  ];

  // Frequently Bought Together Bundle Data
  const bundleItems = [
    {
      name: 'Daawat Rozana Basmati Rice (1kg)',
      price: 120,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
      unit: '1 kg',
    },
    {
      name: 'Fortune Sunlite Refined Cooking Oil (1L)',
      price: 180,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80',
      unit: '1 Litre',
    },
    {
      name: 'Dark Fantasy Choco Fills Biscuits',
      price: 30,
      image: 'https://images.unsplash.com/photo-1616075905085-78e063bb79a7?w=500&q=80',
      unit: '75g',
    },
  ];
  const bundleOriginalPrice = 330;
  const bundlePrice = 299; // ₹31 bundle discount!

  const handleAddBundle = () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      useAuthStore.getState().openLoginPrompt('You need to login first to add items to your cart.');
      return;
    }
    bundleItems.forEach((b) => {
      addItem({
        name: b.name,
        price: b.price,
        image: b.image,
        unit: b.unit,
        vertical: 'supermart',
      });
    });
    toggleCart(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF9] text-brand-text">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 border-b border-white/10 flex items-center justify-center min-h-[360px] sm:min-h-[400px]">
        {/* Background Ken Burns Zoom */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={DEFAULT_BANNER[currentSlide]}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.72, scale: 1.06 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            alt="Floveera supermart supermarket aisle"
          />
        </AnimatePresence>

        {/* Soft Warm Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/65 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 z-0 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide mb-4 border border-white/15"
          >
            <Store className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
            <span>Everyday Groceries & Lifestyle Store</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white mb-3 tracking-tight drop-shadow-md"
          >
            Floveera Supermart
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto drop-shadow-sm font-normal"
          >
            Quality groceries, premium household essentials, non-stick kitchenware, and lifestyle items at genuine market rates.
          </motion.p>
        </div>

        {/* Indicator dots */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center space-x-2" role="tablist" aria-label="Supermart slides">
          {DEFAULT_BANNER.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              aria-selected={idx === currentSlide}
              role="tab"
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-brand-orange w-8' : 'bg-white/40 hover:bg-white/70 w-2.5'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Frequently Bought Together Bundle Section */}
        <section className="mb-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 border border-brand-orange/20 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-orange bg-orange-100/70 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" /> Frequently Bought Together Bundle
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                Daily Cooking Staples Combo
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg">
                Save 10% when buying Basmati Rice (1kg), Cooking Oil (1L), and Chocolate Biscuits together.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {bundleItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 pr-3 rounded-2xl border border-gray-200 shadow-sm">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-xl" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[120px]">{item.name}</p>
                    <p className="text-[11px] font-extrabold text-brand-orange">₹{item.price}</p>
                  </div>
                  {idx < bundleItems.length - 1 && <Plus className="w-3.5 h-3.5 text-gray-400 ml-1" />}
                </div>
              ))}

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0">
                <div className="text-right">
                  <div className="text-lg font-black text-brand-orange leading-none">₹{bundlePrice}</div>
                  <span className="text-xs text-gray-400 line-through">₹{bundleOriginalPrice}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddBundle}
                  className="bg-brand-orange hover:bg-brand-orangeHover text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-brand-orange/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Add 3 Items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="space-y-4 mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          {/* Search and Sort row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search groceries, cleaner, kitchenware..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none bg-gray-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:border-brand-orange outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Department / Aisle horizontal scroll bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-gray-100">
            {supermartAisles.map((aisle) => (
              <button
                key={aisle.id}
                onClick={() => setSelectedCategory(aisle.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                  selectedCategory === aisle.id
                    ? 'bg-brand-orange text-white shadow-sm font-bold'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70'
                }`}
              >
                {aisle.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-shimmer border border-gray-100" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-display">No supermarket items found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try searching with another keyword or pick another aisle category above.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-brand-orange text-white rounded-xl text-xs font-bold hover:bg-brand-orangeHover transition-colors"
            >
              Reset Aisles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((item, index) => (
              <ProductCard
                key={item._id || item.name}
                {...item}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
