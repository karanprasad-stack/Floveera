'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSettingsCurrentUser } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    getSettingsCurrentUser()
      .then((user) => {
        if (!isMounted) return;
        
        if (!user || !user.role) {
          router.push('/login');
          return;
        }

        if (allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          // Fallback routing if role isn't matching
          if (user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        router.push('/login');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <Loader2 className="h-10 w-10 text-brand-orange animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Don't render children if unauthorized while redirecting
  }

  return <>{children}</>;
}
