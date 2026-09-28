'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import SlideshowThumbnail from '@/components/SlideshowThumbnail';
import { ArrowRight, ShoppingBag, Utensils, Cake, Sparkles, Grid } from 'lucide-react';

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
    }, 5500);
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
    { _id: 'pop-jalebi', name: 'Jalebi', description: 'Sweet and crispy', price: 80, image: '/images/jalebi.jpg' },
    { _id: 'pop-samosa', name: 'Samosa', description: 'Hot and spicy', price: 20, image: '/images/samosa.jpg' },
    { _id: 'pop-pizza', name: 'Pizza', description: 'Freshly baked', price: 199, image: '/images/pizza.jpg' },
    { _id: 'pop-burger', name: 'Burger', description: 'Delicious burger', price: 99, image: '/images/burger.jpg' },
    { _id: 'pop-momo', name: 'Momo', description: 'Steamed dumplings', price: 70, image: '/images/momo.jpg' },
    { _id: 'pop-chowmin', name: 'Chowmin', description: 'Spicy noodles', price: 80, image: '/images/chowmin.jpg' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF9] text-brand-text selection:bg-brand-orange selection:text-white">
      <Navigation />

      {/* Hero Section with Ken Burns and Gentle Floating Thumbnails */}
      <section className="relative pt-20 pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden bg-brand-blueDark border-b border-white/10">
        {/* Background Ken Burns Zoom Slider */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={banners[currentSlide]}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.65, scale: 1.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            alt="Floveera Atmosphere"
          />
        </AnimatePresence>
        
        {/* Soft Multi-Layer Warm Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 z-0 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none z-0" />
        
        {/* Floating Category Circular Food Elements with Staggered Bobbing Loops */}
        {/* 1. Top-Left Floating Pizza */}
        <motion.div 
          animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute -left-12 top-14 w-44 h-44 rounded-full p-1 bg-white/10 backdrop-blur-md shadow-2xl border-2 border-white/25 hidden xl:block z-10 select-none pointer-events-none"
        >
          <img 
            src="/images/pizza.jpg" 
            alt="Fresh Pizza" 
            className="w-full h-full object-cover rounded-full shadow-inner"
          />
          <div className="absolute bottom-2 right-2 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
            Hot Pizza
          </div>
        </motion.div>

        {/* 2. Top-Right Floating Jalebi */}
        <motion.div 
          animate={{ y: [8, -8, 8], rotate: [2, -2, 2] }}
          transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut', delay: 0.6 }}
          className="absolute -right-10 top-12 w-40 h-40 rounded-full p-1 bg-white/10 backdrop-blur-md shadow-2xl border-2 border-white/25 hidden xl:block z-10 select-none pointer-events-none"
        >
          <img 
            src="/images/jalebi.jpg" 
            alt="Crisp Jalebi" 
            className="w-full h-full object-cover rounded-full shadow-inner"
          />
          <div className="absolute bottom-2 left-2 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
            Fresh Sweets
          </div>
        </motion.div>

        {/* 3. Bottom-Right Floating Cake */}
        <motion.div 
          animate={{ y: [-6, 6, -6], rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 1.2 }}
          className="absolute right-20 bottom-14 w-32 h-32 rounded-full p-1 bg-white/10 backdrop-blur-md shadow-2xl border-2 border-white/25 hidden 2xl:block z-10 select-none pointer-events-none"
        >
          <img 
            src="/images/cake.jpg" 
            alt="Celebration Cake" 
            className="w-full h-full object-cover rounded-full shadow-inner"
          />
          <div className="absolute bottom-1 right-1 bg-brand-blueLight text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
            Bakery
          </div>
        </motion.div>
        
        {/* Staggered Hero Content */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white/95 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wide mb-6 border border-white/15 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span>Matar, Kaimur&apos;s Premium Destination</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white mb-6 leading-[1.15] tracking-tight drop-shadow-md"
          >
            From Daily Shopping to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Delicious Food
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-base sm:text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Fresh sweets, bespoke bakery, sizzling fast food, and complete supermart essentials delivered with care.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-wrap justify-center gap-4 text-sm font-semibold"
          >
            <Link
              href="/restaurant"
              className="px-7 py-3.5 bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:shadow-glowOrange active:scale-95 transition-all duration-200 rounded-xl text-white shadow-lg flex items-center space-x-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Restaurant</span>
            </Link>
            <Link
              href="/supermart"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/15 active:scale-95 transition-all duration-200 backdrop-blur-md rounded-xl text-white border border-white/20 shadow-md flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-brand-orange" />
              <span>Shop Supermart</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-24">
        
        {/* Three Category Cards with Staggered Entrance & Micro-Interactions */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 1. Restaurant Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 h-full group flex flex-col cursor-pointer border border-gray-100"
            >
              <Link href="/restaurant" className="flex flex-col h-full">
                <SlideshowThumbnail 
                  title="Restaurant" 
                  images={['/images/samosa.jpg', '/images/jalebi.jpg', '/images/pizza.jpg']} 
                />
                <div className="p-6 flex justify-between items-center bg-white flex-1 transition-colors">
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-text mb-0.5">Fresh Bites & Sweets</h4>
                    <p className="text-gray-500 font-medium text-xs sm:text-sm">Hot snacks, sweets & fast food</p>
                  </div>
                  <div className="bg-brand-orange/10 p-3 rounded-2xl group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-glowOrange transition-all duration-200 text-brand-orange shrink-0 ml-4">
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* 2. Supermart Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 h-full group flex flex-col cursor-pointer border border-gray-100"
            >
              <Link href="/supermart" className="flex flex-col h-full">
                <SlideshowThumbnail 
                  title="Supermart" 
                  images={[
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', 
                    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80', 
                    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&q=80'
                  ]} 
                />
                <div className="p-6 flex justify-between items-center bg-white flex-1 transition-colors">
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-text mb-0.5">Everyday Essentials</h4>
                    <p className="text-gray-500 font-medium text-xs sm:text-sm">Groceries, household & garments</p>
                  </div>
                  <div className="bg-brand-blue/10 p-3 rounded-2xl group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-glowBlue transition-all duration-200 text-brand-blue shrink-0 ml-4">
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* 3. Cakes & Bakery Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 h-full group flex flex-col cursor-pointer border border-gray-100"
            >
              <Link href="/cakes" className="flex flex-col h-full">
                <SlideshowThumbnail 
                  title="Cakes & Bakery" 
                  images={[
                    '/images/cake.jpg', 
                    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80', 
                    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&q=80'
                  ]} 
                />
                <div className="p-6 flex justify-between items-center bg-white flex-1 transition-colors">
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-text mb-0.5">Artisanal Bakery</h4>
                    <p className="text-gray-500 font-medium text-xs sm:text-sm">Custom cakes & celebratory delights</p>
                  </div>
                  <div className="bg-brand-orange/10 p-3 rounded-2xl group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-glowOrange transition-all duration-200 text-brand-orange shrink-0 ml-4">
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Quick Category Section ("What's on your mind?") */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mb-20 relative" 
          style={{ zIndex: 40 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-text tracking-tight">
                What&apos;s on your mind?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Explore our most popular categories right now</p>
            </div>
          </div>
          <div className="flex space-x-6 pb-6 px-1" style={{ overflowX: showMore ? 'visible' : 'auto' }}>
            {quickCategories.map((category) => (
              category.name === 'More' ? (
                <div key={category.name} className="relative flex-shrink-0">
                  <motion.div 
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center space-y-2.5 cursor-pointer group"
                    onClick={() => setShowMore(!showMore)}
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-brand-orange to-brand-blue shadow-sm group-hover:shadow-cardHover border-2 border-white transition-all duration-200 flex items-center justify-center">
                      <Grid className="h-8 w-8 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <span className="font-semibold text-gray-700 text-xs sm:text-sm group-hover:text-brand-orange transition-colors">{category.name}</span>
                  </motion.div>
                  {showMore && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full mt-3 right-0 bg-white rounded-2xl shadow-cardHover border border-gray-100 w-64 z-50 overflow-hidden"
                      >
                        <div className="p-2">
                          <Link href="/restaurant" onClick={() => setShowMore(false)} className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-brand-orange/5 active:scale-98 transition-all group">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-orange/20 flex-shrink-0">
                              <img src="/images/samosa.jpg" alt="Restaurant" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-brand-text group-hover:text-brand-orange transition-colors">Restaurant</p>
                              <p className="text-xs text-gray-400">Sweets, snacks & fast food</p>
                            </div>
                          </Link>
                          <Link href="/supermart" onClick={() => setShowMore(false)} className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-brand-blue/5 active:scale-98 transition-all group">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-blue/20 flex-shrink-0">
                              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80" alt="Supermart" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-brand-text group-hover:text-brand-blue transition-colors">Supermart</p>
                              <p className="text-xs text-gray-400">Daily essentials & groceries</p>
                            </div>
                          </Link>
                          <Link href="/cakes" onClick={() => setShowMore(false)} className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-brand-orange/5 active:scale-98 transition-all group">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-orange/20 flex-shrink-0">
                              <img src="/images/cake.jpg" alt="Cakes" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-brand-text group-hover:text-brand-orange transition-colors">Cakes & Bakery</p>
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
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  key={category.name} 
                  className="flex flex-col items-center space-y-2.5 cursor-pointer group flex-shrink-0"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-sm group-hover:shadow-cardHover border border-gray-100 transition-all duration-300 overflow-hidden">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className="font-semibold text-gray-700 text-xs sm:text-sm group-hover:text-brand-orange transition-colors">{category.name}</span>
                </motion.div>
              )
            ))}
          </div>
        </motion.section>

        {/* Popular Items Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-text tracking-tight">
                Popular on Floveera
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Freshly prepared customer favorites in Matar</p>
            </div>
            <Link
              href="/restaurant"
              className="text-brand-orange hover:text-brand-orangeHover font-semibold text-xs sm:text-sm flex items-center space-x-1 group"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {popularItems.map((item, index) => (
              <FoodCard key={item._id || item.name} {...item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* About Floveera Section */}
        <motion.section 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-14 shadow-card border border-gray-100 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-brand-blue/10 text-brand-blue px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span>About Floveera Private Limited</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-brand-text leading-tight tracking-tight">
                Redefining Convenience <br className="hidden lg:block" />& Celebration
              </h2>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Floveera is a modern, hybrid lifestyle destination designed to bring quality, convenience, and joy to every community.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                We combine the everyday utility of a comprehensive <span className="font-semibold text-brand-text">Supermart</span> with the delightful experiences of a fresh <span className="font-semibold text-brand-text">Bakery</span>, authentic <span className="font-semibold text-brand-text">Sweet Shop</span>, and a vibrant <span className="font-semibold text-brand-text">Fast-Food Restaurant</span>—all under one roof in Matar, Kaimur, Bihar.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="bg-orange-50/50 p-4 rounded-2xl border border-brand-orange/10">
                  <h4 className="font-display font-black text-brand-orange text-3xl mb-1">100%</h4>
                  <p className="text-xs text-gray-600 font-medium">Quality assured products & fresh daily ingredients.</p>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-brand-blue/10">
                  <h4 className="font-display font-black text-brand-blue text-3xl mb-1">Ultra-Fast</h4>
                  <p className="text-xs text-gray-600 font-medium">Quick delivery and warm hospitable service.</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
               <motion.div whileHover={{ scale: 1.03, rotate: -1 }} className="h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md group">
                 <img src="/images/samosa.jpg" alt="Restaurant" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               </motion.div>
               <motion.div whileHover={{ scale: 1.03, rotate: 1 }} className="h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md mt-6 group">
                 <img src="/images/jalebi.jpg" alt="Sweets" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               </motion.div>
               <motion.div whileHover={{ scale: 1.03, rotate: -1 }} className="h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md -mt-6 group">
                 <img src="/images/pizza.jpg" alt="Fast Food" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               </motion.div>
               <motion.div whileHover={{ scale: 1.03, rotate: 1 }} className="h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md group">
                 <img src="/images/cake.jpg" alt="Bakery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               </motion.div>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}
