'use client';

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Bed, Info } from 'lucide-react';

export default function BedsManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bed Allocations</h1>
          <p className="text-sm text-muted-foreground mt-1">Review bed occupancy statuses and resident allocation structures.</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="rounded-full bg-indigo-500/10 p-4 text-indigo-500 mb-4">
            <Bed className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Bed Allocations Controlled by Property Managers</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Bed details, types, pricing, and sharing types are configured and allocated by owners and local property managers.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" /> Live bed occupancy statistics are aggregated on the System Overview dashboard.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
