'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';

export default function RestaurantPage() {
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

      <section className="bg-gradient-to-r from-brand-blue to-brand-orange text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">Floveera Restaurant</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Experience the authentic taste of traditional sweets and delicious fast food
            </p>
          </motion.div>
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
