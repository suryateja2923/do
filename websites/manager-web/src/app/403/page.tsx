'use client';

import React from 'react';
import Forbidden from '@/features/authentication/Forbidden';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <Forbidden />
    </div>
  );
}
