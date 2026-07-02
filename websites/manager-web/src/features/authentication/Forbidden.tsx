'use client';

import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

export const Forbidden: React.FC = () => {
  const router = useRouter();
  const logoutUser = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logoutUser();
    router.replace('/login');
  };

  return (
    <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mx-auto">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight">403 - Forbidden Access</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your account does not possess the manager privileges required to access the HomiePG Manager Web Portal.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => router.replace('/login')}
          className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Go to Login
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-500/10"
        >
          <LogOut className="h-4 w-4" /> Clear Session
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
