'use client';

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FileText, Info } from 'lucide-react';

export default function ReportsManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Export Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Export custom CSV spreadsheets or PDF analytical summaries of PG operations.</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="rounded-full bg-violet-500/10 p-4 text-violet-500 mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Operational Reports Export</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Generate and download analytical reports for verified properties, active occupancy ledgers, and billing summaries.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" /> Reports represent active records only.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
