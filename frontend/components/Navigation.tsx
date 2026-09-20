'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home, Store, Utensils, Cake, Phone, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/SearchBar';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Supermart', href: '/supermart', icon: Store },
    { name: 'Restaurant', href: '/restaurant', icon: Utensils },
    { name: 'Cakes & Bakery', href: '/cakes', icon: Cake },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <nav className="bg-brand-blue text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/MyFloveeraLogo.jpeg"
              alt="Floveera"
              className="h-12 w-12 object-contain flex-shrink-0"
            />
            <span className="text-2xl font-bold">Floveera</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8 relative z-50">
            <SearchBar />
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="hover:text-brand-orange transition-colors duration-200 flex items-center space-x-1"
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-white/20"></div>

            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-orangeHover rounded-full hover:from-brand-orangeHover hover:to-brand-orange transition-all duration-300 shadow-md flex items-center space-x-2 text-white font-medium hover:scale-105"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          </div>

          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-blue border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-4 rounded hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-white/10">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-4 rounded bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:from-brand-orangeHover hover:to-brand-orange transition-colors flex items-center space-x-2 text-white font-medium mt-2 shadow-md"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
