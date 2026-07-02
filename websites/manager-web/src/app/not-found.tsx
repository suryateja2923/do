'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
          <FileQuestion className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight">404 - Page Not Found</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page or resource pathway you requested could not be located in the HomiePG Manager system.
          </p>
        </div>

        <Link
          href="/"
          className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
        >
          <Home className="h-4 w-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
