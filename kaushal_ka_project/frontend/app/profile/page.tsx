'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { logoutUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-brand-blue to-brand-orange relative"></div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <div className="h-24 w-24 bg-gradient-to-tr from-brand-orange to-brand-blue rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-500 flex items-center">
                <Shield className="h-4 w-4 mr-1 text-brand-orange" />
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center text-gray-400 mb-2">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium text-sm">Full Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center text-gray-400 mb-2">
                  <Mail className="h-5 w-5 mr-2" />
                  <span className="font-medium text-sm">Email Address</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              </div>
            </div>
            
          </div>
        </motion.div>
      </main>
    </div>
  );
}
