'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AdminService } from '../../services/admin';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../../lib/queryKeys';
import { QUERY_POLICY } from '../../config/queryPolicy';
import { Search, UserCheck, Mail, Phone, Clock } from 'lucide-react';

export default function ManagersManagement() {
  const [search, setSearch] = useState('');
  const { data: managers = [], isLoading: loading, error } = useQuery<any[]>({
    queryKey: adminQueryKeys.managers,
    queryFn: AdminService.getManagers,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  const filteredManagers = managers.filter((m) => {
    const nameMatch = `${m.user?.first_name || ''} ${m.user?.last_name || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const emailMatch = (m.user?.email || '').toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manager Management</h1>
          <p className="text-sm text-muted-foreground mt-1">View and monitor all property managers registered in the system.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search managers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-12 text-center">
            <UserCheck className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-bold text-destructive">Failed To Load Managers</h3>
            <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Managers Found</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no property managers registered matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Manager Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredManagers.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        {m.user?.first_name || ''} {m.user?.last_name || ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" /> {m.user?.email || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" /> {m.user?.phone || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-500">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
