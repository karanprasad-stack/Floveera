'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Store, Utensils, Cake, Phone, LogIn, UserCircle, LayoutDashboard, Star, Package, CreditCard, MapPin, LogOut as LogOutIcon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, fetchUser, isInitialized, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      fetchUser();
    }
  }, [isInitialized, fetchUser]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

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

          <div className="hidden md:flex items-center space-x-6">
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

            {user ? (
              <div className="relative group">
                <button className="px-5 py-2 bg-white text-gray-700 rounded-lg transition-all duration-300 shadow-md flex items-center space-x-2 font-bold hover:bg-gray-50 border border-gray-200 uppercase tracking-wide">
                  <UserCircle className="h-5 w-5 text-gray-500" />
                  <span>{user.name.split(' ')[0]}</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  <div className="p-3 space-y-1">
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                        <LayoutDashboard className="h-5 w-5 text-brand-orange" />
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                      <User className="h-5 w-5 text-[#7DBA3C]" />
                      <span className="font-medium">Your Profile</span>
                    </Link>
                    <Link href="/profile" className="flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                      <Star className="h-5 w-5 text-[#7DBA3C]" />
                      <span className="font-medium">Your Reviews</span>
                    </Link>
                    <Link href="/profile" className="flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                      <Package className="h-5 w-5 text-[#7DBA3C]" />
                      <span className="font-medium">Your Orders</span>
                    </Link>
                    <Link href="/profile" className="flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                      <CreditCard className="h-5 w-5 text-[#7DBA3C]" />
                      <span className="font-medium">Saved Cards</span>
                    </Link>
                    <Link href="/profile" className="flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                      <MapPin className="h-5 w-5 text-[#7DBA3C]" />
                      <span className="font-medium">Manage Address</span>
                    </Link>
                    <Link href="/contact" className="flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-brand-orange transition-colors">
                      <Phone className="h-5 w-5 text-[#7DBA3C]" />
                      <span className="font-medium">Contact Us</span>
                    </Link>
                    
                    <div className="pt-3 mt-2 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#EE4A4A] text-white rounded-lg hover:bg-[#D93A3A] transition-colors font-bold tracking-wide uppercase"
                      >
                        <LogOutIcon className="h-5 w-5" />
                        <span>LOGOUT</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-orangeHover rounded-full hover:from-brand-orangeHover hover:to-brand-orange transition-all duration-300 shadow-md flex items-center space-x-2 text-white font-medium hover:scale-105"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
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
                {user ? (
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/profile'}
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 rounded bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:from-brand-orangeHover hover:to-brand-orange transition-colors flex items-center space-x-2 text-white font-medium mt-2 shadow-md"
                  >
                    {user.role === 'admin' ? <LayoutDashboard className="h-5 w-5" /> : <UserCircle className="h-5 w-5" />}
                    <span>{user.role === 'admin' ? 'Dashboard' : 'Profile'}</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 rounded bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:from-brand-orangeHover hover:to-brand-orange transition-colors flex items-center space-x-2 text-white font-medium mt-2 shadow-md"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
