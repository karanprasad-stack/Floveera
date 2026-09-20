'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, Settings, Plus, LayoutGrid, Search, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutUser } from '@/lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const router = useRouter();
  const { user, isLoading, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/profile');
      }
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Orders', value: '142', icon: ShoppingCart, color: 'text-brand-orange' },
    { label: 'Revenue', value: '₹24,500', icon: Users, color: 'text-brand-blue' },
    { label: 'Products', value: '89', icon: Package, color: 'text-brand-green' },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block border-gray-100 p-6 space-y-8 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-8 w-8 text-brand-orange" />
          <span className="text-2xl font-bold text-brand-blue">Admin</span>
        </div>
        
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'orders' ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Orders</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'products' ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Package className="h-5 w-5" />
            <span>Products</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'categories' ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutGrid className="h-5 w-5" />
            <span>Categories</span>
          </button>
          <Link href="/" className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors font-medium mt-10">
            <Home className="h-5 w-5" />
            <span>Back to Store</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-text capitalize">{activeTab}</h1>
            <p className="text-gray-500 text-sm">Manage your store&apos;s {activeTab}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-sm w-64"
              />
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-brand-text">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-full bg-gray-50 border border-gray-100 shadow-inner ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Mock Tables */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-brand-text">Recent {activeTab}</h3>
            {activeTab === 'products' && (
              <button className="flex items-center space-x-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-orangeHover transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>
          <div className="p-10 text-center text-gray-400 flex flex-col items-center justify-center space-y-4">
            <LayoutGrid className="h-16 w-16 opacity-20" />
            <p>Admin panel UI successfully prototyped.<br/>Connect a database to display live {activeTab}.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
