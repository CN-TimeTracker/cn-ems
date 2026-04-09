'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/authSlice';
import Spinner from '@/components/ui/Spinner';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard Component
 * Client-side route protection.
 * - If not authenticated → Redirect to /login
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [isAuthenticated, router, pathname]);

  // If not authenticated, we return a loading state while the redirect happens
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 mt-4 font-medium animate-pulse">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
