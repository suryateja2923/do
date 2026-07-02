'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PropertyVerificationCenter from '@/features/properties/PropertyVerificationCenter';

export default function PropertiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Property Verification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Perform room configuration audits, verify pricing layouts, check geofences, and approve listings.
          </p>
        </div>
        <PropertyVerificationCenter />
      </div>
    </DashboardLayout>
  );
}
