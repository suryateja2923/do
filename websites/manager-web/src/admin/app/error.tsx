'use client';

import React, { useEffect } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log crash details to console
    console.error('Next.js Client crash boundary triggered:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight">System Error</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error has crashed the client-side session interface.
          </p>
          {error.message && (
            <div className="mt-2 p-3 rounded-lg bg-muted text-[10px] text-muted-foreground text-left font-mono break-all max-h-24 overflow-y-auto">
              {error.message}
            </div>
          )}
        </div>

        <button
          onClick={() => reset()}
          className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Reset Portal State
        </button>
      </div>
    </div>
  );
}
