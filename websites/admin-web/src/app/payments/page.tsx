'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AdminService } from '../../services/admin';
import { Payment } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../../lib/queryKeys';
import { QUERY_POLICY } from '../../config/queryPolicy';
import { Search, CreditCard, Mail, User, ShieldCheck } from 'lucide-react';

export default function PaymentsManagement() {
  const [search, setSearch] = useState('');
  const { data: payments = [], isLoading: loading, error } = useQuery<Payment[]>({
    queryKey: adminQueryKeys.payments,
    queryFn: AdminService.getPayments,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  const filteredPayments = payments.filter((p) => {
    const tenantName = `${p.tenant?.user?.first_name || ''} ${p.tenant?.user?.last_name || ''}`.toLowerCase();
    const email = (p.tenant?.user?.email || '').toLowerCase();
    const transaction = (p.transaction_id || '').toLowerCase();
    return tenantName.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || transaction.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Payments Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor billing transaction histories and incoming tenant rents.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by resident or transaction..."
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
            <CreditCard className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-bold text-destructive">Failed To Load Payments</h3>
            <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Transactions Found</h3>
            <p className="text-sm text-muted-foreground mt-1">No transaction records match your search query.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Resident</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold font-mono text-xs">
                        {p.transaction_id || p.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 font-medium">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {p.tenant?.user?.first_name || 'N/A'} {p.tenant?.user?.last_name || ''}
                          </span>
                          <span className="text-xs text-muted-foreground pl-5 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {p.tenant?.user?.email || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-500">
                        ₹{Number(p.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(p.payment_date || p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : p.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {p.status}
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
