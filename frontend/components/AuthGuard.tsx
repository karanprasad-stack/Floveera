'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({
  children,
  allowedRoles = ['user', 'admin'],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, hasCheckedAuth, checkAuth } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const rolesKey = allowedRoles.join(',');

  useEffect(() => {
    let isMounted = true;

    async function evaluateAuth() {
      let currentUser = user;
      if (!hasCheckedAuth) {
        currentUser = await checkAuth();
      }

      if (!isMounted) return;

      if (!currentUser || !currentUser.role) {
        const returnUrl = encodeURIComponent(pathname || '/');
        router.push(`/login?returnTo=${returnUrl}`);
        return;
      }

      const roles = rolesKey.split(',');
      if (roles.includes(currentUser.role)) {
        setIsAuthorized(true);
      } else {
        if (currentUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    }

    evaluateAuth();

    return () => {
      isMounted = false;
    };
  }, [user, hasCheckedAuth, pathname, rolesKey, router, checkAuth]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]" aria-busy="true">
        <Loader2 className="h-10 w-10 text-brand-orange animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Checking Authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}
