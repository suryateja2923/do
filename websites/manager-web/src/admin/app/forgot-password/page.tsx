'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    // Simulate recovery flow API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSuccess(true);
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {!success ? (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-2xl">
                H
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mt-4">Forgot Password</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your administrative email to receive password reset links.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="admin@homiepg.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Dispatching Recovery Link...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We have dispatched a secure password reset link to <span className="font-semibold text-foreground">{email}</span>.
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login page
          </Link>
        </div>
      </div>
    </div>
  );
}
