'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitCakeOrder } from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Cake, MessageSquare, Scale, Calendar, User, Phone, Mail, CheckCircle, Clock } from 'lucide-react';

export default function CakesPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    cakeType: '',
    message: '',
    weight: '',
    deliveryDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [trackingStep, setTrackingStep] = useState(0);

  const banners = [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&q=80',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1600&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1600&q=80',
    'https://images.unsplash.com/photo-1519869325930-281384150729?w=1600&q=80'
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    let timer1: number;
    let timer2: number;
    if (isOrderSuccess) {
      setTrackingStep(1);
      timer1 = window.setTimeout(() => setTrackingStep(2), 3000);
      timer2 = window.setTimeout(() => setTrackingStep(3), 7000);
    }
    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, [isOrderSuccess]);

  const cakeTypes = [
    { name: 'Chocolate Cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80' },
    { name: 'Vanilla Cake', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&q=80' },
    { name: 'Black Forest', image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&q=80' },
    { name: 'Butterscotch', image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&q=80' },
    { name: 'Red Velvet', image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500&q=80' },
    { name: 'Fruit Cake', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&q=80' },
  ];

  const weights = ['500g', '1kg', '1.5kg', '2kg', '2.5kg', '3kg', 'Custom'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Send standard API request to Express backend
      const response = await submitCakeOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        cakeId: null, // Since we're missing foreign relations temporarily due to raw data
        size: formData.weight,
        specialInstructions: formData.message,
        deliveryDate: formData.deliveryDate,
        status: 'pending'
      });

      setSubmitMessage('Order submitted successfully! We will contact you soon.');
      setOrderDetails({...formData});
      setIsOrderSuccess(true);
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        cakeType: '',
        message: '',
        weight: '',
        deliveryDate: '',
      });
    } catch (error) {
      setSubmitMessage('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
            alt="Cakes Banner"
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
            <Cake className="h-16 w-16 mx-auto mb-4 text-brand-orange drop-shadow-md" />
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Cakes & Bakery</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
              Custom cakes for every occasion - birthdays, anniversaries, celebrations, and more!
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-brand-blue mb-6">Our Cake Selection</h2>
              <div className="grid grid-cols-2 gap-4">
                {cakeTypes.map((cake, index) => (
                  <motion.div
                    key={cake.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-32 w-full relative">
                      <img src={cake.image} alt={cake.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-gray-800">{cake.name}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 bg-brand-blue/5 border border-brand-blue/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-brand-blue mb-4">Why Choose Our Cakes?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Fresh ingredients daily
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Custom designs available
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Eggless options available
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Same-day delivery for orders before 2 PM
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {!isOrderSuccess ? (
                <div className="p-8">
                  <h2 className="text-3xl font-bold text-brand-blue mb-6">Order Your Cake</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Cake className="inline h-4 w-4 mr-1" />
                    Cake Type
                  </label>
                  <select
                    name="cakeType"
                    value={formData.cakeType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select cake type</option>
                    {cakeTypes.map((cake) => (
                      <option key={cake.name} value={cake.name}>
                        {cake.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scale className="inline h-4 w-4 mr-1" />
                    Weight
                  </label>
                  <select
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select weight</option>
                    {weights.map((weight) => (
                      <option key={weight} value={weight}>
                        {weight}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="inline h-4 w-4 mr-1" />
                    Message on Cake
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter message for the cake"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-lg ${submitMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Order'}
                </button>

                  <a
                  href="https://wa.me/919113342012"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-brand-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-center"
                >
                  Order via WhatsApp
                </a>
              </form>
                </div>
              ) : (
                <div className="flex flex-col h-full bg-white">
                  <div className="bg-gradient-to-r from-brand-blue to-brand-green p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-xl"
                    >
                      <CheckCircle className="h-12 w-12 text-brand-green" />
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-2 relative z-10">Order Confirmed!</h2>
                    <p className="text-white/90 relative z-10 text-lg">Thank you, {orderDetails?.customerName?.split(' ')[0]}. Your cake is being prepared.</p>
                  </div>
                  
                  <div className="p-8 flex-1">
                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-xs text-brand-blue uppercase tracking-wider font-bold mb-1.5 flex items-center"><Clock className="w-3 h-3 mr-1"/> Cake Details</p>
                        <p className="font-extrabold text-brand-text text-lg">{orderDetails?.cakeType}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{orderDetails?.weight} • {new Date(orderDetails?.deliveryDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-brand-orange/10 p-3 rounded-full">
                        <Cake className="h-8 w-8 text-brand-orange" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-brand-text mb-6">Track Order</h3>
                    
                    <div className="relative border-l-2 border-brand-orange/20 ml-4 space-y-8 pb-4">
                      {/* Step 1 */}
                      <div className="relative pl-8">
                        <div className={`absolute -left-[11px] top-0.5 h-5 w-5 rounded-full ${trackingStep >= 1 ? 'bg-brand-green' : 'bg-gray-200'} border-4 border-white flex items-center justify-center transition-colors duration-500`}></div>
                        <p className={`font-semibold text-lg ${trackingStep >= 1 ? 'text-brand-text' : 'text-gray-400'}`}>Order Accepted</p>
                        <p className="text-sm text-gray-500 mt-0.5">We have received your order details.</p>
                      </div>
                      
                      {/* Step 2 */}
                      <div className="relative pl-8">
                        <div className={`absolute -left-[11px] top-0.5 h-5 w-5 rounded-full ${trackingStep >= 2 ? 'bg-brand-orange' : 'bg-gray-200'} border-4 border-white flex items-center justify-center transition-colors duration-500`}></div>
                        <p className={`font-semibold text-lg ${trackingStep >= 2 ? 'text-brand-text' : 'text-gray-400'}`}>Baking in Progress</p>
                        <p className="text-sm text-gray-500 mt-0.5">Chef is preparing your fresh cake!</p>
                      </div>
                      
                      {/* Step 3 */}
                      <div className="relative pl-8">
                        <div className={`absolute -left-[11px] top-0.5 h-5 w-5 rounded-full ${trackingStep >= 3 ? 'bg-brand-blue' : 'bg-gray-200'} border-4 border-white flex items-center justify-center transition-colors duration-500`}></div>
                        <p className={`font-semibold text-lg ${trackingStep >= 3 ? 'text-brand-text' : 'text-gray-400'}`}>Ready for Delivery</p>
                        <p className="text-sm text-gray-500 mt-0.5">Your cake is packed and ready.</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => { setIsOrderSuccess(false); setTrackingStep(0); }}
                      className="mt-8 w-full bg-brand-orange/10 text-brand-orange py-3.5 rounded-xl font-bold hover:bg-brand-orange hover:text-white transition-all duration-300"
                    >
                      Place Another Order
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
