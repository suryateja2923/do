'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_CONFIG } from '@/config/auth';
import { AlertCircle, RotateCcw, LogOut } from 'lucide-react';

export const SessionWarning: React.FC = () => {
  const { isAuthenticated, logout, refreshSession } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const performLogout = useCallback(() => {
    logout();
    window.location.replace('/session-expired');
  }, [logout]);

  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowWarning(false);
    setCountdown(60);

    // Fire warning at 14 minutes (1 minute before 15-min timeout)
    inactivityTimerRef.current = setTimeout(() => {
      setShowWarning(true);

      let count = 60;
      countdownIntervalRef.current = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current!);
          performLogout();
        }
      }, 1000);
    }, AUTH_CONFIG.INACTIVITY_TIMEOUT_MS - AUTH_CONFIG.WARNING_TIMEOUT_MS);
  }, [isAuthenticated, performLogout]);

  const extendSession = async () => {
    await refreshSession();
    resetTimers();
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimers();
    events.forEach((evt) => window.addEventListener(evt, handleActivity));
    resetTimers();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isAuthenticated, resetTimers]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-foreground">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mx-auto animate-bounce">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-lg">Inactivity Warning</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your manager session has been idle. You will be logged out automatically in{' '}
            <span className="font-bold text-amber-500">{countdown} seconds</span>.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={extendSession}
            className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer text-xs"
          >
            <RotateCcw className="h-4 w-4" /> Keep Session Active
          </button>
          <button
            onClick={performLogout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 font-bold hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer text-xs"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
