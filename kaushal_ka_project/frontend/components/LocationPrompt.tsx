'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationPrompt({ variant = 'nav' }: { variant?: 'nav' | 'hero' }) {
  const [location, setLocation] = useState<string>('Select Location');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if location is already saved in localStorage
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    } else {
      // Trigger modal on first visit
      setTimeout(() => setIsModalOpen(true), 1000);
    }
  }, []);

  const handleSelectLocation = (loc: string) => {
    setLocation(loc);
    localStorage.setItem('userLocation', loc);
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={variant === 'nav' 
          ? "flex items-center space-x-2 text-white/90 hover:text-white transition-colors bg-black/10 px-3 py-1.5 rounded-full text-sm font-medium"
          : "w-full flex items-center bg-transparent px-6 py-4 text-brand-text hover:bg-gray-50 transition-colors h-full"}
      >
        <MapPin className={`h-5 w-5 ${variant === 'nav' ? 'text-brand-orange' : 'text-brand-orange mr-3'}`} />
        <span className={`truncate text-left font-medium ${variant === 'hero' ? 'flex-1 text-base' : 'max-w-[150px] sm:max-w-[200px]'}`}>
          {variant === 'hero' && location === 'Select Location' ? 'Enter delivery location' : 
            variant === 'hero' ? location : `Delivering to: ${location}`}
        </span>
        <ChevronDown className={`h-4 w-4 ${variant === 'nav' ? 'opacity-70' : 'text-gray-400'}`} />
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl p-6 z-[110] shadow-2xl"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-brand-orange/10 rounded-full mb-6 mx-auto">
                  <MapPin className="h-8 w-8 text-brand-orange" />
                </div>
                <h2 className="text-2xl font-bold text-center text-brand-blue mb-2">Select Delivery Location</h2>
                <p className="text-center text-gray-500 mb-6">Enter your location to see products available in your area.</p>

                <div className="space-y-3">
                  <button 
                    onClick={() => handleSelectLocation('Matar, Kaimur')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-brand-orange/5 border border-gray-100 hover:border-brand-orange/30 rounded-xl transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-brand-text group-hover:text-brand-orange transition-colors">Matar, Kaimur</span>
                      <span className="text-sm text-gray-500">Serviceable Area</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSelectLocation('Bhabua, Kaimur')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-brand-orange/5 border border-gray-100 hover:border-brand-orange/30 rounded-xl transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-brand-text group-hover:text-brand-orange transition-colors">Bhabua, Kaimur</span>
                      <span className="text-sm text-gray-500">Serviceable Area</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSelectLocation('Mohania, Kaimur')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-brand-orange/5 border border-gray-100 hover:border-brand-orange/30 rounded-xl transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-brand-text group-hover:text-brand-orange transition-colors">Mohania, Kaimur</span>
                      <span className="text-sm text-gray-500">Serviceable Area</span>
                    </div>
                  </button>
                </div>

                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 font-medium"
                  >
                    Skip for now
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
