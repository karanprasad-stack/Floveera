'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import { Sparkles, Shirt, Home as HomeIcon, Utensils, Scissors, Gift, ShoppingBag, Box, Smartphone, Lightbulb, Baby, Heart } from 'lucide-react';

export default function SupermartPage() {
  const categories = [
    { name: 'Beauty & Personal Care', icon: Sparkles, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80' },
    { name: 'Garments', icon: Shirt, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80' },
    { name: 'Household Items', icon: HomeIcon, image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80' },
    { name: 'Kitchenware', icon: Utensils, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80' },
    { name: 'Tailoring Accessories', icon: Scissors, image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&q=80' },
    { name: 'Jewellery & Gifts', icon: Gift, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80' },
    { name: 'FMCG Products', icon: ShoppingBag, image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=500&q=80' },
    { name: 'Plastic Utility Items', icon: Box, image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&q=80' },
    { name: 'Electronics', icon: Smartphone, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80' },
    { name: 'Home Decor', icon: Lightbulb, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80' },
    { name: 'Baby Care', icon: Baby, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80' },
    { name: 'Health & Wellness', icon: Heart, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80' },
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
            <h1 className="text-5xl font-bold mb-4">Floveera Supermart</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Your one-stop destination for all daily essentials, quality products at affordable prices
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
            <h2 className="text-4xl font-bold text-brand-blue mb-4">Shop by Category</h2>
            <div className="w-20 h-1 bg-brand-orange mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.name}
                name={category.name}
                icon={category.icon}
                image={category.image}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <ShoppingBag className="h-16 w-16 text-brand-orange mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Wide Range</h3>
              <p className="text-gray-600">Thousands of products across multiple categories</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6"
            >
              <Gift className="h-16 w-16 text-brand-orange mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing on all products</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center p-6"
            >
              <Heart className="h-16 w-16 text-brand-orange mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Quality Assured</h3>
              <p className="text-gray-600">Only genuine and quality products</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
