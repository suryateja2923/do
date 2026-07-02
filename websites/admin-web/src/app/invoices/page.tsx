'use client';

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Receipt, Info } from 'lucide-react';

export default function InvoicesManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Rental Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Review tenant billing details and system-generated monthly invoices.</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="rounded-full bg-violet-500/10 p-4 text-violet-500 mb-4">
            <Receipt className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Invoicing Cycle Handled by Managers</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Monthly rent invoices and security deposits are automatically generated and sent to residents by managers and owners.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" /> Live payment records can be monitored under the Payments Log route.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
