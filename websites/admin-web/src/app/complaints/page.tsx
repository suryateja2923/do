'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AdminService } from '../../services/admin';
import { Complaint } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../../lib/queryKeys';
import { QUERY_POLICY } from '../../config/queryPolicy';
import { Search, AlertTriangle, User, Building, ShieldCheck } from 'lucide-react';

export default function ComplaintsManagement() {
  const [search, setSearch] = useState('');
  const { data: complaints = [], isLoading: loading, error } = useQuery<Complaint[]>({
    queryKey: adminQueryKeys.complaints,
    queryFn: AdminService.getComplaints,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  const filteredComplaints = complaints.filter((c) => {
    const tenantName = `${c.tenant?.user?.first_name || ''} ${c.tenant?.user?.last_name || ''}`.toLowerCase();
    const title = (c.title || '').toLowerCase();
    const propName = (c.property?.name || '').toLowerCase();
    return tenantName.includes(search.toLowerCase()) || title.includes(search.toLowerCase()) || propName.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Resident Complaints</h1>
          <p className="text-sm text-muted-foreground mt-1">Review active support tickets, property damage issues, and resident escalations.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by resident, property or issue..."
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
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-bold text-destructive">Failed To Load Complaints</h3>
            <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Complaints Found</h3>
            <p className="text-sm text-muted-foreground mt-1">No ticket reports match your search query.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Title & Issue</th>
                    <th className="px-6 py-4">Resident</th>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{c.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{c.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.tenant?.user?.first_name || 'N/A'} {c.tenant?.user?.last_name || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.property?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.priority === 'HIGH' || c.priority === 'URGENT'
                            ? 'bg-rose-500/10 text-rose-500'
                            : c.priority === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${
                          c.status === 'RESOLVED' || c.status === 'CLOSED'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : c.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {c.status}
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
