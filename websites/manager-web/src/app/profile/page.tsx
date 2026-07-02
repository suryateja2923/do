'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProfileCenter from '@/features/profile/ProfileCenter';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manager Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure profile details, manage security, and change notifications preferences.
          </p>
        </div>
        <ProfileCenter />
      </div>
    </DashboardLayout>
  );
}
