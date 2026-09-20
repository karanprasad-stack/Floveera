'use client';

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import LocationPrompt from '@/components/LocationPrompt';
import SlideshowThumbnail from '@/components/SlideshowThumbnail';
import { Search, ArrowRight, ShoppingBag, Grid } from 'lucide-react';

export default function Home() {
  const banners = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80', // Groceries
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80', // Fast Food
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80',   // Restaurant
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&q=80', // Cake
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const [showMore, setShowMore] = useState(false);
  const quickCategories = [
    { name: 'Sweets', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=300&q=80' },
    { name: 'Fast Food', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80' },
    { name: 'Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80' },
    { name: 'Groceries', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80' },
    { name: 'Garments', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80' },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80' },
    { name: 'Tailoring', image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=300&q=80' },
    { name: 'More', image: 'https://images.unsplash.com/photo-1506617429158-171f5225e170?w=300&q=80' },
  ];

  const popularItems = [
    { name: 'Jalebi', description: 'Sweet and crispy', price: 80, image: '/images/jalebi.jpg' },
    { name: 'Samosa', description: 'Hot and spicy', price: 20, image: '/images/samosa.jpg' },
    { name: 'Pizza', description: 'Freshly baked', price: 199, image: '/images/pizza.jpg' },
    { name: 'Burger', description: 'Delicious burger', price: 99, image: '/images/burger.jpg' },
    { name: 'Momo', description: 'Steamed dumplings', price: 70, image: '/images/momo.jpg' },
    { name: 'Chowmin', description: 'Spicy noodles', price: 80, image: '/images/chowmin.jpg' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F3F4F6]">
      <Navigation />

      {/* Swiggy-Style Hero Section */}
      <section className="relative pt-16 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-900 border-b-4 border-brand-orange">
        {/* Background Auto-Slider */}
        <AnimatePresence>
          <motion.img
            key={currentSlide}
            src={banners[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.5, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover z-0"
            alt="Homepage Banner"
          />
        </AnimatePresence>
        
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-0"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 z-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 z-10"></div>
        
        {/* Decorative food images */}
        <motion.img 
          initial={{ opacity: 0, x: -50, rotate: -20 }}
          animate={{ opacity: 0.8, x: 0, rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          src="/images/pizza.jpg" 
          alt="Pizza" 
          className="absolute -left-16 top-10 w-48 h-48 object-cover rounded-full border-4 border-white/20 shadow-2xl hidden lg:block"
        />
        <motion.img 
          initial={{ opacity: 0, x: 50, rotate: 20 }}
          animate={{ opacity: 0.8, x: 0, rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          src="/images/jalebi.jpg" 
          alt="Jalebi" 
          className="absolute -right-16 top-8 w-40 h-40 object-cover rounded-full border-4 border-white/20 shadow-2xl hidden lg:block"
        />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-md"
          >
            From Daily Shopping to Delicious Food
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Fresh sweets, bakery, fast food and daily essentials delivered quickly.
          </motion.p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
        
        {/* Swiggy-Style Service Cards */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/restaurant">
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] transition-all h-full group flex flex-col cursor-pointer border border-gray-100"
              >
                <SlideshowThumbnail 
                  title="Restaurant" 
                  images={['/images/samosa.jpg', '/images/jalebi.jpg', '/images/pizza.jpg']} 
                />
                <div className="p-6 flex justify-between items-center bg-white flex-1">
                  <p className="text-gray-500 font-medium text-sm sm:text-base">Hot snacks, sweets and fast food</p>
                  <div className="bg-brand-orange/10 p-3 rounded-full group-hover:bg-brand-orange group-hover:text-white transition-colors text-brand-orange shrink-0 ml-4">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/supermart">
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] transition-all h-full group flex flex-col cursor-pointer border border-gray-100"
              >
                <SlideshowThumbnail 
                  title="Supermart" 
                  images={[
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', 
                    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80', 
                    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&q=80'
                  ]} 
                />
                <div className="p-6 flex justify-between items-center bg-white flex-1">
                  <p className="text-gray-500 font-medium text-sm sm:text-base">Daily essentials and groceries</p>
                  <div className="bg-brand-blue/10 p-3 rounded-full group-hover:bg-brand-blue group-hover:text-white transition-colors text-brand-blue shrink-0 ml-4">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/cakes">
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] transition-all h-full group flex flex-col cursor-pointer border border-gray-100"
              >
                <SlideshowThumbnail 
                  title="Cakes & Bakery" 
                  images={[
                    '/images/cake.jpg', 
                    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80', 
                    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&q=80'
                  ]} 
                />
                <div className="p-6 flex justify-between items-center bg-white flex-1">
                  <p className="text-gray-500 font-medium text-sm sm:text-base">Custom cakes and fresh bakery items</p>
                  <div className="bg-brand-orange/10 p-3 rounded-full group-hover:bg-brand-orange group-hover:text-white transition-colors text-brand-orange shrink-0 ml-4">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Quick Category Section */}
        <section className="mb-16 relative" style={{ zIndex: 40 }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-text">What&apos;s on your mind?</h2>
          </div>
          <div className="flex space-x-6 pb-6 px-1" style={{ overflowX: showMore ? 'visible' : 'auto' }}>
            {quickCategories.map((category) => (
              category.name === 'More' ? (
                <div key={category.name} className="relative flex-shrink-0">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center space-y-3 cursor-pointer group"
                    onClick={() => setShowMore(!showMore)}
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-orange to-brand-blue shadow-sm group-hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.15)] border-2 border-white transition-all flex items-center justify-center">
                      <Grid className="h-10 w-10 text-white" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm group-hover:text-brand-orange transition-colors">{category.name}</span>
                  </motion.div>
                  {showMore && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-full mt-3 right-0 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-100 w-64 z-50 overflow-hidden"
                      >
                        <div className="p-2">
                          <Link href="/restaurant" onClick={() => setShowMore(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-orange/5 transition-colors group">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-orange/20 flex-shrink-0">
                              <img src="/images/samosa.jpg" alt="Restaurant" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-brand-text group-hover:text-brand-orange transition-colors">Restaurant</p>
                              <p className="text-xs text-gray-400">Sweets, snacks & fast food</p>
                            </div>
                          </Link>
                          <Link href="/supermart" onClick={() => setShowMore(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-blue/5 transition-colors group">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-blue/20 flex-shrink-0">
                              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80" alt="Supermart" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-brand-text group-hover:text-brand-blue transition-colors">Supermart</p>
                              <p className="text-xs text-gray-400">Daily essentials & groceries</p>
                            </div>
                          </Link>
                          <Link href="/cakes" onClick={() => setShowMore(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-orange/5 transition-colors group">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-orange/20 flex-shrink-0">
                              <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80" alt="Cakes" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-brand-text group-hover:text-brand-orange transition-colors">Cakes & Bakery</p>
                              <p className="text-xs text-gray-400">Custom cakes & bakery items</p>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              ) : (
                <motion.div 
                  whileHover={{ y: -5 }}
                  key={category.name} 
                  className="flex flex-col items-center space-y-3 cursor-pointer group flex-shrink-0"
                >
                  <div className="w-24 h-24 rounded-full bg-white shadow-sm group-hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 transition-all overflow-hidden">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className="font-semibold text-gray-700 text-sm group-hover:text-brand-orange transition-colors">{category.name}</span>
                </motion.div>
              )
            ))}
          </div>
        </section>

        {/* Popular Items Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-brand-text mb-8">Popular on Floveera</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {popularItems.map((item, index) => (
              <FoodCard key={item.name} {...item} index={index} />
            ))}
          </div>
        </section>

        {/* About Company Section */}
        <section className="mb-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] border border-gray-100 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-block bg-brand-blue/10 text-brand-blue px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-2">
                About Floveera Private Limited
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-brand-text leading-tight tracking-tight">
                Redefining Convenience <br className="hidden lg:block" />& Celebration
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Floveera is a modern, hybrid lifestyle destination designed to bring quality, convenience, and joy to every community.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We combine the everyday utility of a comprehensive <span className="font-semibold text-brand-text">Supermart</span> with the delightful experiences of a fresh <span className="font-semibold text-brand-text">Bakery</span>, authentic <span className="font-semibold text-brand-text">Sweet Shop</span>, and a vibrant <span className="font-semibold text-brand-text">Fast-Food Restaurant</span>—all under one roof. Our commitment is to deliver operational excellence and the best service to our customers.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="font-black text-brand-orange text-3xl mb-1">100%</h4>
                  <p className="text-sm text-gray-500 font-medium">Quality assured products & fresh ingredients.</p>
                </div>
                <div>
                  <h4 className="font-black text-brand-blue text-3xl mb-1">Ultra-Fast</h4>
                  <p className="text-sm text-gray-500 font-medium">Quick delivery and seamless shopping experience.</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
               <motion.div whileHover={{ scale: 1.02, rotate: -1 }} className="h-48 rounded-2xl overflow-hidden shadow-md">
                 <img src="/images/samosa.jpg" alt="Restaurant" className="w-full h-full object-cover" />
               </motion.div>
               <motion.div whileHover={{ scale: 1.02, rotate: 1 }} className="h-48 rounded-2xl overflow-hidden shadow-md mt-8">
                 <img src="/images/jalebi.jpg" alt="Sweets" className="w-full h-full object-cover" />
               </motion.div>
               <motion.div whileHover={{ scale: 1.02, rotate: -1 }} className="h-48 rounded-2xl overflow-hidden shadow-md -mt-8">
                 <img src="/images/pizza.jpg" alt="Fast Food" className="w-full h-full object-cover" />
               </motion.div>
               <motion.div whileHover={{ scale: 1.02, rotate: 1 }} className="h-48 rounded-2xl overflow-hidden shadow-md">
                 <img src="/images/cake.jpg" alt="Bakery" className="w-full h-full object-cover" />
               </motion.div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
