'use client';

import React, { useState, useEffect } from 'react';
import { ManagerService } from '@/services/manager';
import { Booking } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { QUERY_POLICY } from '@/config/queryPolicy';
import { Card, SkeletonLoader, StatusBadge, EmptyState, Button } from '@/shared';
import { useFilters, useSearch } from '@/hooks/useShared';
import { formatDate, formatCurrency } from '@/utils';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_BOOKINGS: Booking[] = [];

export const BookingVerificationCenter: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: bookings = EMPTY_BOOKINGS,
    isLoading: loading,
    error,
    refetch: fetchBookings,
  } = useQuery<Booking[]>({
    queryKey: managerQueryKeys.bookings,
    queryFn: ManagerService.getBookings,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { filters, updateFilter } = useFilters({
    status: 'ALL' as 'ALL' | Booking['status'],
  });

  const { query: search, setQuery: setSearch, filteredItems: searchedBookings } = useSearch(bookings, [
    'status',
  ]);

  // Actions states
  const [notes, setNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const verifyBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Booking['status'] }) =>
      ManagerService.verifyBooking(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.bookings }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  useEffect(() => {
    setSelectedBooking(null);
  }, [filters.status]);

  const handleVerify = async (status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
    if (!selectedBooking) return;
    if (status !== 'APPROVED' && !notes.trim()) {
      toast.warning('Notes required', { description: 'Please explain the rejection or cancellation reason.' });
      return;
    }

    setSubmittingAction(true);
    try {
      await verifyBookingMutation.mutateAsync({ id: selectedBooking.id, status });
      toast.success(`Booking status updated to ${status}`);
      fetchBookings();
      setSelectedBooking(null);
    } catch (err: any) {
      toast.error('Failed to update booking status', {
        description: err?.message || 'Server rejected booking verification update.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredBookings = searchedBookings.filter((b) => {
    const matchesStatus = filters.status === 'ALL' || b.status === filters.status;
    return matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateFilter('status', s)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                filters.status === s
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listing */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonLoader className="h-36 rounded-2xl" />
              <SkeletonLoader className="h-36 rounded-2xl" />
            </div>
          ) : error ? (
            <EmptyState title="Failed To Load Bookings" description={error} icon={AlertTriangle} />
          ) : filteredBookings.length === 0 ? (
            <EmptyState title="No Bookings found" description="No booking allocations matching selection filters." icon={CalendarCheck} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`rounded-2xl border p-5 bg-card shadow-sm cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden group ${
                    selectedBooking?.id === b.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        Tenant: {b.tenant?.user.first_name} {b.tenant?.user.last_name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        Room {b.bed?.room?.room_number || 'N/A'} &bull; {b.bed?.room?.property?.name || 'No Property'}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>Move In: {formatDate(b.move_in_date)}</span>
                    <span className="font-bold text-foreground">{formatCurrency(b.rent_amount || 0)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Card */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <Card className="sticky top-24 max-h-[85vh] overflow-y-auto animate-in fade-in duration-200 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base">Booking Verification File</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Booking ID: {selectedBooking.id}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Security info - Personal Doc Boundaries */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex gap-3 text-xs">
                <Lock className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-500">Document Security Bounds</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Personal tenant documentation (Aadhaar cards, passports, background checks) are hidden from managers to maintain privacy standards.
                  </p>
                </div>
              </div>

              {/* Financial values */}
              <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border/30 text-xs">
                <p className="font-bold text-foreground">Financial Summary</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Monthly Rent</span>
                    <span className="font-bold text-foreground text-xs">{formatCurrency(selectedBooking.rent_amount || 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Security Deposit</span>
                    <span className="font-bold text-foreground text-xs">{formatCurrency(selectedBooking.security_deposit || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Allocation Timeline</h4>
                <div className="rounded-xl border border-border p-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Move In Date:</span>
                    <span className="font-semibold text-foreground">{formatDate(selectedBooking.move_in_date)}</span>
                  </div>
                  {selectedBooking.move_out_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Move Out Date:</span>
                      <span className="font-semibold text-foreground">{formatDate(selectedBooking.move_out_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Form */}
              {selectedBooking.status === 'PENDING' && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Decision Notes</label>
                    <textarea
                      placeholder="Feedback notes (mandatory for rejection or cancellation)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleVerify('APPROVED')} isLoading={submittingAction} className="flex-1">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button onClick={() => handleVerify('REJECTED')} variant="destructive" isLoading={submittingAction} className="flex-1">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              )}

              {selectedBooking.status === 'APPROVED' && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Cancellation Reason</label>
                    <textarea
                      placeholder="Provide operational cancellation reason..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <Button onClick={() => handleVerify('CANCELLED')} variant="destructive" isLoading={submittingAction} className="w-full">
                    <AlertTriangle className="h-4 w-4" /> Cancel Booking Allocation
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground space-y-2 sticky top-24">
              <CalendarCheck className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Audit Resident Bookings</h4>
              <p className="text-xs">Select an allocation file to review dates, check bed identifiers, and approve or reject moving timelines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingVerificationCenter;
