'use client';

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { History, Info } from 'lucide-react';

export default function AuditLogsManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">Review system logs, administrator actions, and database status records.</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="rounded-full bg-violet-500/10 p-4 text-violet-500 mb-4">
            <History className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Audit Log Trail</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Writers and administrators activity records are saved dynamically to database tables to enforce security policies.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" /> Operations audit is restricted to super-administrative roles.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
