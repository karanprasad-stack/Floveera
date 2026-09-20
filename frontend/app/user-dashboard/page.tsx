'use client';

import AuthGuard from '@/components/AuthGuard';

import { useEffect, useState } from 'react';
import { Package, Heart, CreditCard, Settings, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSettingsCurrentUser, logoutUser } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getSettingsCurrentUser().then((user) => {
      if (user && user.role) {
        setUserRole(user.role);
      }
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block border-gray-100 p-6 space-y-8 flex-shrink-0">
         <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold text-lg">
              U
            </div>
            <span className="text-xl font-bold text-brand-text">My Account</span>
         </div>
         
         <nav className="space-y-3">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'orders' ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Package className="h-5 w-5" />
              <span>My Orders</span>
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'wishlist' ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Heart className="h-5 w-5" />
              <span>Wishlist</span>
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'payments' ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Payments</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'settings' ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
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
              <p className="text-gray-500 text-sm">Manage your personal {activeTab}</p>
            </div>
            
            {userRole === 'admin' && (
              <Button 
                onClick={() => router.push('/admin')}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white"
              >
                Switch to Admin Dashboard
              </Button>
            )}
         </header>

         {/* Content Placeholder */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
               {activeTab === 'orders' && <Package className="h-16 w-16 opacity-20" />}
               {activeTab === 'wishlist' && <Heart className="h-16 w-16 opacity-20" />}
               {activeTab === 'payments' && <CreditCard className="h-16 w-16 opacity-20" />}
               {activeTab === 'settings' && <Settings className="h-16 w-16 opacity-20" />}
               <p className="mt-4">You have no items in {activeTab} yet.</p>
            </div>
         </div>
      </main>
    </div>
  );
}
