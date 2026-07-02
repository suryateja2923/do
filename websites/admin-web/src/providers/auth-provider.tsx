'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth';

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/unauthorized',
  '/session-expired',
  '/403',
  '/500',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated, initSession } = useAuthStore();

  // Initialize session state on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (loading) return;

    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (!isAuthenticated) {
      if (!isPublicPath) {
        // Redirect unauthenticated requests to login
        router.replace('/login');
      }
    } else {
      // User is logged in, check role authorization
      if (user?.role !== 'ADMIN') {
        if (!isPublicPath || pathname === '/login') {
          // Block non-admin roles from accessing admin portal
          router.replace('/403');
        }
      } else {
        if (pathname === '/login') {
          // Prevent loading login page when already active
          router.replace('/');
        }
      }
    }
  }, [loading, isAuthenticated, pathname, user, router]);

  // Loading Screen Loader
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold tracking-wider text-muted-foreground animate-pulse">
            Authenticating HomiePG Admin session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
