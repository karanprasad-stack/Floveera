'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';

export default function RestaurantPage() {
  const banners = [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80'
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const traditionalSweets = [
    { name: 'Jalebi', description: 'Crispy and sweet', price: 80, image: '/images/jalebi.jpg' },
    { name: 'Laddu', description: 'Traditional favorite', price: 60, image: '/images/laddu.jpg' },
    { name: 'Launglatta', description: 'Sweet delight', price: 70, image: '/images/launglatta.jpg' },
    { name: 'Chhena', description: 'Fresh and soft', price: 420, unit: '/ kg', image: '/images/chhena.jpg' },
    { name: 'Soan Papdi', description: 'Melt-in-mouth sweet', price: 100, image: '/images/soan_papdi.jpg' },
    { name: 'Mithai Varieties', description: 'Assorted sweets', price: 120, image: '/images/mithai.jpg' },
  ];

  const snacks = [
    { name: 'Samosa', description: 'Hot and crispy', price: 20, image: '/images/samosa.jpg' },
    { name: 'Pakodi', description: 'Spicy fritters', price: 30, image: '/images/pakodi.jpg' },
    { name: 'Chhola', description: 'Tasty chickpeas', price: 40, image: '/images/chhola.jpg' },
  ];

  const fastFood = [
    { name: 'Pizza', description: 'Freshly baked', price: 199, image: '/images/pizza.jpg' },
    { name: 'Burger', description: 'Delicious burger', price: 99, image: '/images/burger.jpg' },
    { name: 'Chowmin', description: 'Spicy noodles', price: 80, image: '/images/chowmin.jpg' },
    { name: 'Momo', description: 'Steamed dumplings', price: 70, image: '/images/momo.jpg' },
    { name: 'Paneer Roll', description: 'Stuffed roll', price: 90, image: '/images/paneer_roll.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <section className="relative text-white py-32 overflow-hidden flex items-center justify-center min-h-[400px]">
        {/* Background Auto-Slider */}
        <AnimatePresence>
          <motion.img
            key={currentSlide}
            src={banners[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover z-0"
            alt="Restaurant Banner"
          />
        </AnimatePresence>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Floveera Restaurant</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md text-gray-100">
              Experience the authentic taste of traditional sweets and delicious fast food
            </p>
          </motion.div>
        </div>
        
        {/* Progress Dots */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-brand-orange w-8' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-brand-blue mb-4">Traditional Sweets</h2>
            <div className="w-20 h-1 bg-brand-orange mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {traditionalSweets.map((item, index) => (
              <FoodCard key={item.name} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-brand-blue mb-4">Snacks</h2>
            <div className="w-20 h-1 bg-brand-orange mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {snacks.map((item, index) => (
              <FoodCard key={item.name} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-brand-blue mb-4">Fast Food</h2>
            <div className="w-20 h-1 bg-brand-orange mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fastFood.map((item, index) => (
              <FoodCard key={item.name} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-orange text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Order via WhatsApp</h2>
            <p className="text-lg mb-6">Get your favorite food delivered or ready for pickup</p>
            <a
              href="https://wa.me/919113342012"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-orange px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block shadow-lg"
            >
              Order Now on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
