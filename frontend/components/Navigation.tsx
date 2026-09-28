'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Home, Store, Utensils, Cake, Phone, LogIn, ChevronDown, User as UserIcon, Package, LogOut, Shield, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, checkAuth, hasCheckedAuth, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsOpen(false);
    await logout();
    router.push('/');
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Supermart', href: '/supermart', icon: Store },
    { name: 'Restaurant', href: '/restaurant', icon: Utensils },
    { name: 'Cakes & Bakery', href: '/cakes', icon: Cake },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Account';

  return (
    <header className="sticky top-0 z-50">
      <nav 
        aria-label="Main Navigation"
        className={`transition-all duration-300 ${
          scrolled 
            ? 'bg-brand-blue/95 backdrop-blur-md shadow-lg border-b border-white/10' 
            : 'bg-brand-blue shadow-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 transition-all duration-300">
            <Link 
              href="/" 
              onClick={() => {
                setIsOpen(false);
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-3 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl" 
              aria-label="Floveera Home"
            >
              <div className="relative flex items-center justify-center">
                <Image
                  src="/images/floveera_logo_clean.png"
                  alt="Floveera official brand logo"
                  className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
                  width={44}
                  height={44}
                  priority
                />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-white hover:text-white/95 transition-colors">
                Floveera
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8 relative z-50">
              <SearchBar />
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex space-x-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative group py-2 px-1 text-white/90 hover:text-white transition-colors duration-200 flex items-center space-x-1.5 text-sm font-medium"
                  >
                    <link.icon className="h-4 w-4 text-brand-orange/80 group-hover:text-brand-orange transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                    <span>{link.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-200 ease-out group-hover:w-full rounded-full" />
                  </Link>
                ))}
              </div>

              <div className="h-6 w-px bg-white/20" aria-hidden="true"></div>

              {/* Reactive Auth State (Logged In Avatar or Login CTA) */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-expanded={isUserMenuOpen}
                    aria-label="User profile menu"
                    className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-inner">
                      {userInitial}
                    </div>
                    <span className="text-sm font-semibold tracking-wide max-w-[100px] truncate">{firstName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-brand-orange' : 'text-white/80'}`} aria-hidden="true" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-cardHover border border-gray-100 overflow-hidden z-50 text-gray-800"
                      >
                        <div className="p-4 border-b border-gray-100 bg-gray-50/70">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm font-bold text-brand-text truncate mt-0.5">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        <div className="p-2 space-y-1">
                          <Link
                            href="/account/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors"
                          >
                            <Package className="w-4 h-4 text-brand-orange" aria-hidden="true" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            href="/account/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-brand-blue" aria-hidden="true" />
                            <span>Profile & Settings</span>
                          </Link>

                          <div className="h-px bg-gray-100 my-1" aria-hidden="true" />

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" aria-hidden="true" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2 bg-gradient-to-r from-brand-orange to-brand-orangeHover rounded-xl hover:shadow-glowOrange active:scale-95 transition-all duration-200 shadow-md flex items-center space-x-2 text-white font-semibold text-sm tracking-wide"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Login</span>
                </Link>
              )}

              {/* Cart Button with Dynamic Badge (Shown only after login) */}
              {user && (
                <button
                  onClick={() => toggleCart(true)}
                  className="relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15 flex items-center justify-center"
                  aria-label={`Open shopping cart (${totalItems} items)`}
                >
                  <ShoppingBag className="w-4 h-4 text-white" aria-hidden="true" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="flex md:hidden items-center space-x-2">
              {/* Mobile Cart Button (Shown only after login) */}
              {user && (
                <button
                  onClick={() => toggleCart(true)}
                  className="relative p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-white"
                  aria-label={`Open shopping cart (${totalItems} items)`}
                >
                  <ShoppingBag className="h-5 w-5 text-white" aria-hidden="true" />
                  {totalItems > 0 && (
                    <span className="absolute 0 right-0 bg-brand-orange text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-white"
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation-menu"
              >
                {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-navigation-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden bg-brand-blue/98 backdrop-blur-xl border-t border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {/* Mobile Search Input */}
                <div className="pb-2">
                  <SearchBar />
                </div>

                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2.5 px-4 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all flex items-center space-x-3 text-white/95 font-medium"
                    >
                      <link.icon className="h-5 w-5 text-brand-orange" aria-hidden="true" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10">
                  {user ? (
                    <div className="space-y-2 bg-white/10 p-3 rounded-2xl">
                      <div className="flex items-center space-x-3 pb-2 border-b border-white/10">
                        <div className="w-10 h-10 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center">
                          {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-white/70 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href="/account/orders"
                          onClick={() => setIsOpen(false)}
                          className="py-2 px-3 bg-white/10 rounded-xl text-xs font-semibold text-white text-center hover:bg-white/20"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/account/profile"
                          onClick={() => setIsOpen(false)}
                          className="py-2 px-3 bg-white/10 rounded-xl text-xs font-semibold text-white text-center hover:bg-white/20"
                        >
                          Profile & Settings
                        </Link>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl text-xs font-semibold text-center transition-all"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:from-brand-orangeHover hover:to-brand-orange active:scale-98 transition-all flex items-center justify-center space-x-2 text-white font-semibold shadow-md"
                    >
                      <LogIn className="h-5 w-5" aria-hidden="true" />
                      <span>Login to Your Account</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
