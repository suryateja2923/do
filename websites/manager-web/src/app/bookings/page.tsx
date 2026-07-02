'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import BookingVerificationCenter from '@/features/bookings/BookingVerificationCenter';

export default function BookingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Resident Allocation Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit bed allocations, check move-in schedules, check deposit status, and confirm tenant bookings.
          </p>
        </div>
        <BookingVerificationCenter />
      </div>
    </DashboardLayout>
  );
}
