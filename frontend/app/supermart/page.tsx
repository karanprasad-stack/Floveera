'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Sparkles, Shirt, Home as HomeIcon, Utensils, Scissors, Gift, ShoppingBag, Box, Smartphone, Lightbulb, Baby, Heart } from 'lucide-react';

export default function SupermartPage() {
  const banners = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=80',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1600&q=80',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=80'
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const supermartCategories = [
    {
      name: 'Beauty & Personal Care',
      icon: Sparkles,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
      items: [
        { name: 'Premium Shampoo', price: 150, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80', description: 'Hair care essential' },
        { name: 'Refreshing Body Wash', price: 200, image: 'https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?w=500&q=80', description: 'Refreshing shower gel' },
        { name: 'Moisturizing Face Cream', price: 250, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500&q=80', description: 'Moisturizing formula' },
        { name: 'Hair Oil', price: 120, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80', description: 'Nourishing oil' },
      ],
    },
    {
      name: 'Garments',
      icon: Shirt,
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80',
      items: [
        { name: "Men's Cotton T-Shirt", price: 399, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', description: 'Comfortable everyday wear' },
        { name: "Women's Designer Kurti", price: 499, image: 'https://images.unsplash.com/photo-1583391733958-d15ce113bc66?w=500&q=80', description: 'Elegant ethnic wear' },
        { name: 'Classic Blue Jeans', price: 899, image: 'https://images.unsplash.com/photo-1542272604-780c109eeeb8?w=500&q=80', description: 'Durable denim' },
        { name: 'Kids Casual Wear', price: 299, image: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=500&q=80', description: 'Soft and comfy' },
      ],
    },
    {
      name: 'Household Items',
      icon: HomeIcon,
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80',
      items: [
        { name: 'Floor Cleaner', price: 99, image: 'https://images.unsplash.com/photo-1584820927498-cafe2c1c8f1e?w=500&q=80', description: 'Kills 99.9% germs' },
        { name: 'Detergent Powder', price: 149, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80', description: 'For bright clothes' },
        { name: 'Dishwash Liquid', price: 50, image: 'https://images.unsplash.com/photo-1621535791338-7fba0b996160?w=500&q=80', description: 'Tough on grease' },
        { name: 'Room Freshener', price: 120, image: 'https://images.unsplash.com/photo-1572297660522-835ba85eb24a?w=500&q=80', description: 'Pleasant fragrance' },
      ],
    },
    {
      name: 'Kitchenware',
      icon: Utensils,
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80',
      items: [
        { name: 'Non-stick Fry Pan', price: 599, image: 'https://images.unsplash.com/photo-1585238258359-99e7abf268b3?w=500&q=80', description: 'Easy cooking' },
        { name: 'Serving Spoons Set', price: 199, image: 'https://images.unsplash.com/photo-1590794056226-79fea3bfed04?w=500&q=80', description: 'Stainless steel' },
        { name: 'Storage Containers', price: 299, image: 'https://images.unsplash.com/photo-1587391918349-f597951c8e76?w=500&q=80', description: 'Airtight jars' },
        { name: 'Coffee Mug Set', price: 150, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80', description: 'Ceramic mugs' },
      ],
    },
    {
      name: 'Tailoring Accessories',
      icon: Scissors,
      image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&q=80',
      items: [
        { name: 'Colorful Thread Set', price: 50, image: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?w=500&q=80', description: 'Multi-color threads' },
        { name: 'Tailoring Scissors', price: 120, image: 'https://images.unsplash.com/photo-1622396118928-89c56ca5e0eb?w=500&q=80', description: 'Sharp and durable' },
        { name: 'Measuring Tape', price: 30, image: 'https://images.unsplash.com/photo-1559981442-998db4ca1965?w=500&q=80', description: 'Flexible tape' },
        { name: 'Sewing Needles Box', price: 40, image: 'https://images.unsplash.com/photo-1594921980838-8977fd461eb1?w=500&q=80', description: 'Assorted sizes' },
      ],
    },
    {
      name: 'Jewellery & Gifts',
      icon: Gift,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
      items: [
        { name: 'Artificial Necklace', price: 299, image: 'https://images.unsplash.com/photo-1599643478524-fb66ba45362ce?w=500&q=80', description: 'Elegant design' },
        { name: 'Gift Wrapping Paper', price: 20, image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=500&q=80', description: 'Assorted colors' },
        { name: 'Cute Soft Toy', price: 399, image: 'https://images.unsplash.com/photo-1559454473-b684bc91ebfd?w=500&q=80', description: 'Teddy bear' },
        { name: 'Designer Earrings', price: 150, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80', description: 'Party wear' },
      ],
    },
    {
      name: 'FMCG Products',
      icon: ShoppingBag,
      image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=500&q=80',
      items: [
        { name: 'Chocolate Biscuits', price: 30, image: 'https://images.unsplash.com/photo-1616075905085-78e063bb79a7?w=500&q=80', description: 'Crunchy snack' },
        { name: 'Potato Chips', price: 20, image: 'https://images.unsplash.com/photo-1566478989037-eade3f79cb2ba?w=500&q=80', description: 'Salted chips' },
        { name: 'Refined Cooking Oil', price: 180, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', description: '1 Litre pouch' },
        { name: 'Premium Tea Leaves', price: 220, image: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=500&q=80', description: 'Rich aroma' },
      ],
    },
    {
      name: 'Plastic Utility Items',
      icon: Box,
      image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&q=80',
      items: [
        { name: 'Plastic Bucket 20L', price: 150, image: 'https://images.unsplash.com/photo-1585834335443-41bbdcfcebd3?w=500&q=80', description: 'Unbreakable material' },
        { name: 'Pedal Dustbin', price: 199, image: 'https://images.unsplash.com/photo-1595304153966-2679234850fa?w=500&q=80', description: 'For better hygiene' },
        { name: 'Bathroom Mug', price: 30, image: 'https://images.unsplash.com/photo-1632731046927-4a0b38ed7f3e?w=500&q=80', description: 'Durable plastic' },
        { name: 'Laundry Basket', price: 299, image: 'https://images.unsplash.com/photo-1618090584126-129cd1f3f4c2?w=500&q=80', description: 'Large capacity' },
      ],
    },
    {
      name: 'Electronics',
      icon: Smartphone,
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',
      items: [
        { name: 'Wired Earphones', price: 299, image: 'https://images.unsplash.com/photo-1505236273191-1dce886b01e9?w=500&q=80', description: 'Bass boosted' },
        { name: 'Fast Charger 20W', price: 199, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80', description: 'Type-C cable included' },
        { name: 'LED Bulb 9W', price: 99, image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&q=80', description: 'Energy saving' },
        { name: 'Extension Board', price: 350, image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&q=80', description: '4 Sockets' },
      ],
    },
    {
      name: 'Home Decor',
      icon: Lightbulb,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80',
      items: [
        { name: 'Designer Wall Clock', price: 399, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&q=80', description: 'Silent sweep movement' },
        { name: 'Artificial Plant Pot', price: 199, image: 'https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=500&q=80', description: 'Indoor decoration' },
        { name: 'Scented Candles Set', price: 149, image: 'https://images.unsplash.com/photo-1602874623157-19036c0a0058?w=500&q=80', description: 'Lavender scent' },
        { name: 'Photo Frame', price: 120, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80', description: 'Fits 5x7 photo' },
      ],
    },
    {
      name: 'Baby Care',
      icon: Baby,
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80',
      items: [
        { name: 'Baby Diapers Pack', price: 399, image: 'https://images.unsplash.com/photo-1555548682-6f29fbde81a0?w=500&q=80', description: 'Soft and absorbent' },
        { name: 'Gentle Baby Wipes', price: 99, image: 'https://images.unsplash.com/photo-1584346820549-ee4c42456f91?w=500&q=80', description: 'Alcohol-free' },
        { name: 'Baby Lotion', price: 199, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80', description: 'For delicate skin' },
        { name: 'Baby Soap', price: 60, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&q=80', description: 'Tear-free formula' },
      ],
    },
    {
      name: 'Health & Wellness',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80',
      items: [
        { name: 'Organic Green Tea', price: 150, image: 'https://images.unsplash.com/photo-1627435601361-b960b73c26d7?w=500&q=80', description: 'Antioxidant rich' },
        { name: 'Multivitamins Box', price: 499, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80', description: 'Daily essential' },
        { name: 'Protein Energy Bar', price: 50, image: 'https://images.unsplash.com/photo-1622340356985-1d0b305e7144?w=500&q=80', description: 'Healthy snack' },
        { name: 'First Aid Kit', price: 250, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&q=80', description: 'Emergency supplies' },
      ],
    },
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
            alt="Supermart Banner"
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Floveera Supermart</h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto drop-shadow-md">
              Your one-stop destination for all daily essentials, quality products at affordable prices
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

      {supermartCategories.map((category, catIndex) => (
        <section key={category.name} className={`py-12 ${catIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8 flex flex-col items-center md:flex-row md:justify-between"
            >
              <div className="text-center md:text-left mb-4 md:mb-0">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <category.icon className="w-8 h-8 text-brand-orange" />
                  <h2 className="text-3xl font-bold text-brand-blue">{category.name}</h2>
                </div>
                <div className="w-20 h-1 bg-brand-orange mx-auto md:mx-0"></div>
              </div>
              <p className="text-gray-500 text-sm">Showing top items in {category.name}</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {category.items.map((item, index) => (
                <ProductCard
                  key={item.name}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

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
