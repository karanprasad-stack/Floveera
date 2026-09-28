'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { Store } from 'lucide-react';

export default function CrmRootPage() {
  const router = useRouter();
  const { user, restaurant, role, isLoading, hasCheckedAuth, checkCrmAuth } = useCrmAuthStore();

  useEffect(() => {
    checkCrmAuth();
  }, [checkCrmAuth]);

  useEffect(() => {
    if (!isLoading && hasCheckedAuth) {
      if (user && restaurant && (role === 'RESTAURANT_ADMIN' || role === 'RESTAURANT_WORKER')) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, restaurant, role, isLoading, hasCheckedAuth, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-150">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm">
          <Store className="w-5 h-5 animate-pulse" />
        </div>
        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Checking Restaurant CRM Session...</p>
      </div>
    </div>
  );
}
