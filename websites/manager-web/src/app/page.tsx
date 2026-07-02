'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ManagerDashboard from '@/features/dashboard/ManagerDashboard';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ManagerDashboard />
    </DashboardLayout>
  );
}
