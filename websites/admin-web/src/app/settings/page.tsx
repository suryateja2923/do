'use client';

import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Settings, Info } from 'lucide-react';

export default function SettingsManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global application setup values, rate limit rules, and security policies.</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="rounded-full bg-violet-500/10 p-4 text-violet-500 mb-4">
            <Settings className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Global Control Panel</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Control standard platform variables, configure payment gateways integration, and SMTP credentials.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4" /> Changes here update settings across all portals.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
