'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ReportsCenter from '@/features/reports/ReportsCenter';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Operational Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit operational metrics, daily activities, verify complaint summaries and property listings approvals.
          </p>
        </div>
        <ReportsCenter />
      </div>
    </DashboardLayout>
  );
}
