'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ItemCustomizerModal, { CustomizerProduct } from '@/components/ItemCustomizerModal';
import {
  Cake,
  Sparkles,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  Plus,
  Star,
  Search,
} from 'lucide-react';
import { getProducts, submitCakeOrder } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const DEFAULT_BANNER = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&q=80',
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1600&q=80',
  'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1600&q=80',
];

export default function CakesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [flavorFilter, setFlavorFilter] = useState<'all' | 'eggless' | 'chocolate' | 'fruit'>('all');

  const [cakes, setCakes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Customizer modal
  const [customizerProduct, setCustomizerProduct] = useState<CustomizerProduct | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Custom Request Form State
  const [customForm, setCustomForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    cakeType: 'Designer Tier Cake',
    weight: '1kg',
    message: '',
    deliveryDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_BANNER.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Fetch cakes
  useEffect(() => {
    let isMounted = true;
    async function loadCakes() {
      try {
        setIsLoading(true);
        const data = await getProducts({ vertical: 'cakes' });
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCakes(data);
        }
      } catch (err) {
        console.warn('Using local fallback for cakes catalog');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCakes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCustomizer = (cake: any) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      useAuthStore.getState().openLoginPrompt('You need to login first to customize and order cakes.');
      return;
    }
    setCustomizerProduct({
      ...cake,
      vertical: 'cakes',
    });
    setIsCustomizerOpen(true);
  };

  const handleCustomOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await submitCakeOrder({
        customerName: customForm.customerName,
        customerPhone: customForm.customerPhone,
        customerEmail: customForm.customerEmail,
        cakeId: null,
        size: customForm.weight,
        specialInstructions: customForm.message,
        deliveryDate: customForm.deliveryDate,
        status: 'pending',
      });
      setSubmitMessage('Custom order submitted successfully! Our head pastry chef will contact you.');
      setCustomForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        cakeType: 'Designer Tier Cake',
        weight: '1kg',
        message: '',
        deliveryDate: '',
      });
    } catch (err: any) {
      setSubmitMessage(err?.message || 'Failed to submit order enquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCakes = useMemo(() => {
    return cakes.filter((c) => {
      if (flavorFilter === 'eggless' && c.dietary !== 'eggless') return false;
      if (flavorFilter === 'chocolate' && !c.name.toLowerCase().includes('choco') && !c.name.toLowerCase().includes('black forest') && !c.name.toLowerCase().includes('truffle')) return false;
      if (flavorFilter === 'fruit' && !c.name.toLowerCase().includes('fruit') && !c.name.toLowerCase().includes('velvet')) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [cakes, flavorFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF9] text-brand-text">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 border-b border-white/10 flex items-center justify-center min-h-[360px] sm:min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={DEFAULT_BANNER[currentSlide]}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.72, scale: 1.06 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            alt="Artisanal cakes and celebratory bakery display"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/65 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 z-0 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide mb-4 border border-white/15"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
            <span>Celebrations & Artisanal Baking</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white mb-3 tracking-tight drop-shadow-md"
          >
            Floveera Cakes & Bakery
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto drop-shadow-sm font-normal"
          >
            100% vegetarian & eggless specialty cakes, custom piped inscriptions, and scheduled party deliveries across Matar.
          </motion.p>
        </div>

        <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center space-x-2" role="tablist" aria-label="Cake slides">
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
        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chocolate, red velvet, fruit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none bg-gray-50/50"
              />
            </div>

            {/* Flavor filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              <button
                onClick={() => setFlavorFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  flavorFilter === 'all'
                    ? 'bg-brand-orange text-white font-bold shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Cakes
              </button>
              <button
                onClick={() => setFlavorFilter('eggless')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  flavorFilter === 'eggless'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🌱 100% Eggless
              </button>
              <button
                onClick={() => setFlavorFilter('chocolate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  flavorFilter === 'chocolate'
                    ? 'bg-brand-orange text-white font-bold shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🍫 Chocolate & Truffle
              </button>
              <button
                onClick={() => setFlavorFilter('fruit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  flavorFilter === 'fruit'
                    ? 'bg-brand-orange text-white font-bold shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🍓 Fruit & Velvet
              </button>
            </div>
          </div>
        </div>

        {/* Signature Cakes Catalog */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-text">
                Signature Celebration Cakes
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Baked fresh with custom piped message &amp; choice of delivery date
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-72 animate-shimmer border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCakes.map((cake, index) => (
                <motion.div
                  key={cake._id || cake.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-cardHover transition-all overflow-hidden flex flex-col group"
                >
                  <div className="h-52 overflow-hidden relative bg-gray-100">
                    <img
                      src={cake.imageUrl || cake.image}
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      🌱 100% Eggless
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-xl">
                      From ₹{cake.price}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-base sm:text-lg font-bold font-display text-gray-900 group-hover:text-brand-orange transition-colors">
                        {cake.name}
                      </h3>
                      <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex-shrink-0">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600 mr-1" />
                        <span>{cake.rating || 4.9}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {cake.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <span className="text-xs text-gray-400 font-medium">Starts at</span>
                        <div className="text-lg font-black text-brand-orange leading-tight">
                          ₹{cake.price} <span className="text-xs text-gray-400 font-normal">/ 500g</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCustomizer(cake)}
                        className="bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:opacity-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-brand-orange/20 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Customize & Order</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Custom Tier Cake Enquiry Section */}
        <section className="bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 border border-brand-orange/20 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-brand-orange bg-orange-100 px-3 py-1 rounded-full">
              Bespoke Party Orders
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mt-3">
              Need a Custom Multi-Tier Party Cake?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Tell us your theme, weight, and delivery date. Our head pastry chef will craft it to perfection.
            </p>
          </div>

          <form onSubmit={handleCustomOrderSubmit} className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={customForm.customerName}
                  onChange={(e) => setCustomForm({ ...customForm, customerName: e.target.value })}
                  placeholder="e.g. Suman Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-orange outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={customForm.customerPhone}
                  onChange={(e) => setCustomForm({ ...customForm, customerPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-orange outline-none bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Approx Size / Weight</label>
                <select
                  value={customForm.weight}
                  onChange={(e) => setCustomForm({ ...customForm, weight: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-orange outline-none bg-white"
                >
                  <option value="1kg">1 kg (Tier 1)</option>
                  <option value="2kg">2 kg (Tier 2)</option>
                  <option value="3kg+">3 kg+ (Multi-Tier)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={customForm.deliveryDate}
                  onChange={(e) => setCustomForm({ ...customForm, deliveryDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-orange outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Theme / Instructions</label>
              <textarea
                rows={3}
                placeholder="Describe your theme (e.g., Superhero theme, fondant flowers, gold foil, dark truffle flavor)..."
                value={customForm.message}
                onChange={(e) => setCustomForm({ ...customForm, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-orange outline-none bg-white resize-none"
              />
            </div>

            {submitMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 text-center font-medium">
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-98 transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Custom Cake Enquiry'}
            </button>
          </form>
        </section>
      </main>

      {/* Item Customizer Modal for direct ordering with message & date slot */}
      <ItemCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        product={customizerProduct}
      />

      <Footer />
    </div>
  );
}
