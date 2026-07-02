'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../validations/login.schema';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { apiClient } from '../../api/apiClient';
import { API_ENDPOINTS } from '../../api/endpoints';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    setFormError('');

    try {
      const response: any = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: data.email,
        password: data.password,
      });

      if (response && response.data) {
        const { token, user } = response.data;
        login(data.email, token, user);
        router.replace('/');
      } else {
        throw new Error('Authentication response is empty');
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.message;
      setFormError(serverMessage || 'Invalid email or password');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background px-6 text-foreground relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-2xl shadow-lg shadow-primary/20">
            H
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mt-4">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">Access the HomiePG Administrative Dashboard</p>
        </div>

        {formError && (
          <div className="mt-6 rounded-lg bg-rose-500/10 p-3 text-xs font-semibold text-rose-500 text-center">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="admin@homiepg.com"
                {...register('email')}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
            </div>
            {errors.email && <span className="text-[10px] text-rose-500 font-semibold">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-12 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <span className="text-[10px] text-rose-500 font-semibold">{errors.password.message}</span>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-border text-primary bg-background focus:ring-primary cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer select-none">
              Remember my session
            </label>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              'Sign In as Administrator'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
