'use client';

import React, { useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'next/navigation';

export default function SessionExpiredPage() {
  const router = useRouter();
  const logoutUser = useAuthStore((state) => state.logout);

  // Automatically clear expired session states on mount
  useEffect(() => {
    logoutUser();
  }, [logoutUser]);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mx-auto animate-pulse">
          <Clock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight">Session Expired</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your login session has expired due to inactivity or token revocation. Please sign in again to access database controls.
          </p>
        </div>

        <button
          onClick={() => router.replace('/login')}
          className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          Return to Sign In <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
