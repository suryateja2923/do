'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import NotificationsCenter from '@/features/notifications/NotificationsCenter';

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish broad announcements, dispatch targeted updates, and alert owners of pending actions.
          </p>
        </div>
        <NotificationsCenter />
      </div>
    </DashboardLayout>
  );
}
