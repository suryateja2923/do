'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AdminService } from '../../services/admin';
import { Booking } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../../lib/queryKeys';
import { QUERY_POLICY } from '../../config/queryPolicy';
import { Search, CalendarCheck, User, Building, CreditCard } from 'lucide-react';

export default function BookingsManagement() {
  const [search, setSearch] = useState('');
  const { data: bookings = [], isLoading: loading, error } = useQuery<Booking[]>({
    queryKey: adminQueryKeys.bookings,
    queryFn: AdminService.getBookings,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  const filteredBookings = bookings.filter((b) => {
    const tenantName = `${b.tenant?.user?.first_name || ''} ${b.tenant?.user?.last_name || ''}`.toLowerCase();
    const propName = (b.bed?.room?.property?.name || '').toLowerCase();
    return tenantName.includes(search.toLowerCase()) || propName.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Booking Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and monitor resident booking agreements across PG properties.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by tenant or property..."
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
            <CalendarCheck className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-bold text-destructive">Failed To Load Bookings</h3>
            <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Bookings Found</h3>
            <p className="text-sm text-muted-foreground mt-1">No property bookings match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Tenant</th>
                    <th className="px-6 py-4">Property & Room</th>
                    <th className="px-6 py-4">Rent & Deposit</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {b.tenant?.user?.first_name || 'N/A'} {b.tenant?.user?.last_name || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            {b.bed?.room?.property?.name || 'N/A'}
                          </span>
                          <span className="text-xs text-muted-foreground pl-5">
                            Room {b.bed?.room?.room_number || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex flex-col">
                          <span>Rent: ₹{b.rent_amount || 0}</span>
                          <span className="text-xs">Deposit: ₹{b.security_deposit || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${
                          b.status === 'APPROVED' || b.status === 'MOVE_IN'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : b.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {b.status}
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
