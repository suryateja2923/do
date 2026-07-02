'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ComplaintManagementCenter from '@/features/complaints/ComplaintManagementCenter';

export default function ComplaintsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Complaint Ticketing Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resolve resident maintenance requests, allocate field staff, and update ticket progress.
          </p>
        </div>
        <ComplaintManagementCenter />
      </div>
    </DashboardLayout>
  );
}
