'use client';

import React from 'react';
import LoginForm from '@/features/authentication/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      <LoginForm />
    </div>
  );
}
