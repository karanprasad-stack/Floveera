'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FoodCard, { FoodCardItem } from '@/components/FoodCard';
import ItemCustomizerModal, { CustomizerProduct } from '@/components/ItemCustomizerModal';
import {
  Utensils,
  Search,
  SlidersHorizontal,
  Flame,
  Truck,
  Sparkles,
  Check,
  Star,
} from 'lucide-react';
import { getProducts } from '@/lib/api';

const DEFAULT_BANNER = [
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80',
];

export default function RestaurantPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'bestseller'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  const [products, setProducts] = useState<FoodCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Customizer modal state
  const [customizerProduct, setCustomizerProduct] = useState<CustomizerProduct | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Hero auto-slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_BANNER.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Fetch products from backend API with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadRestaurantMenu() {
      try {
        setIsLoading(true);
        const data = await getProducts({ vertical: 'restaurant' });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Using local fallback catalog for restaurant menu');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRestaurantMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  // Categories metadata
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'sweets', label: 'Traditional Sweets' },
    { id: 'snacks', label: 'Hot Snacks' },
    { id: 'fastfood', label: 'Fast Food' },
  ];

  // Filtering and sorting logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category match
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Dietary match
      if (dietaryFilter === 'veg' && item.dietary !== 'veg') {
        return false;
      }
      if (dietaryFilter === 'bestseller' && !item.isBestseller) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return (b.ratingCount || 0) - (a.ratingCount || 0); // Popularity
    });
  }, [products, activeCategory, dietaryFilter, searchQuery, sortBy]);

  const handleOpenCustomizer = (item: FoodCardItem) => {
    setCustomizerProduct({
      ...item,
      vertical: 'restaurant',
    });
    setIsCustomizerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF9] text-brand-text">
      <Navigation />

      {/* Hero Banner Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 border-b border-white/10 flex items-center justify-center min-h-[360px] sm:min-h-[400px]">
        {/* Background Auto-Slider with Slow Zoom */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={DEFAULT_BANNER[currentSlide]}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.72, scale: 1.06 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            alt="Floveera restaurant cuisine banner"
          />
        </AnimatePresence>

        {/* Soft Warm Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/65 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 z-0 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide mb-4 border border-white/15"
          >
            <Utensils className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
            <span>Fresh Dine & Takeaway in Matar</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white mb-3 tracking-tight drop-shadow-md"
          >
            Floveera Restaurant
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto drop-shadow-sm font-normal"
          >
            Experience authentic traditional sweets, piping-hot street snacks, and stone-baked fast food crafted fresh daily.
          </motion.p>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center space-x-2" role="tablist" aria-label="Hero banner slides">
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

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Delivery Highlights Badge */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-brand-orange/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <span className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-brand-orange flex-shrink-0">
              ⚡
            </span>
            <span>
              Estimated Kitchen Prep & Delivery: <span className="text-brand-orange font-bold">20–30 Minutes</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>FREE Delivery on orders ₹299+</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          {/* Search and Sort row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food, pizza, sweets..."
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

          {/* Category Tabs & Dietary Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-brand-orange text-white shadow-sm font-bold'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Dietary filters */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  dietaryFilter === 'all'
                    ? 'border-gray-800 bg-gray-800 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors ${
                  dietaryFilter === 'veg'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Pure Veg
              </button>
              <button
                onClick={() => setDietaryFilter('bestseller')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors ${
                  dietaryFilter === 'bestseller'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Bestsellers
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid Display */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-shimmer border border-gray-100" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-3">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-display">No menu items found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or switching category filters.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setDietaryFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-brand-orange text-white rounded-xl text-xs font-bold hover:bg-brand-orangeHover transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((item, index) => (
              <FoodCard
                key={item._id || item.name}
                {...item}
                index={index}
                onCustomize={handleOpenCustomizer}
              />
            ))}
          </div>
        )}
      </main>

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        product={customizerProduct}
      />

      <Footer />
    </div>
  );
}
