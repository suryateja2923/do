'use client';

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { User, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileManagement() {
  const { currentUser } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your active admin account details and credentials.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm max-w-xl">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {currentUser?.first_name || 'System'} {currentUser?.last_name || 'Admin'}
              </h3>
              <p className="text-sm text-muted-foreground">{currentUser?.email || 'admin@homiepg.com'}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 text-sm">
              <span className="text-muted-foreground font-semibold">User Role</span>
              <span className="col-span-2 text-foreground font-bold">{currentUser?.role || 'ADMIN'}</span>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <span className="text-muted-foreground font-semibold">Phone Number</span>
              <span className="col-span-2 text-foreground">{currentUser?.phone || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <span className="text-muted-foreground font-semibold">Created Date</span>
              <span className="col-span-2 text-foreground">
                {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
