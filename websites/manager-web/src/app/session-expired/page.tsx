'use client';

import React from 'react';
import SessionExpired from '@/features/authentication/SessionExpired';

export default function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <SessionExpired />
    </div>
  );
}
