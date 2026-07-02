'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OwnerVerificationCenter from '@/features/owners/OwnerVerificationCenter';

export default function OwnersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Owner Verification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Perform KYC checks, review business credentials, and grant or restrict portal access to PG owners.
          </p>
        </div>
        <OwnerVerificationCenter />
      </div>
    </DashboardLayout>
  );
}
