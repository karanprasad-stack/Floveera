'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Loader2 } from 'lucide-react';

export default function UserDashboardRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings' || tab === 'profile' || tab === 'addresses' || tab === 'payments') {
      router.replace(`/account/profile${tab === 'settings' ? '' : `?tab=${tab}`}`);
    } else {
      router.replace('/account/orders');
    }
  }, [router, searchParams]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange mb-3" />
        <p className="text-xs font-semibold text-gray-400">Loading your account...</p>
      </div>
    </AuthGuard>
  );
}
