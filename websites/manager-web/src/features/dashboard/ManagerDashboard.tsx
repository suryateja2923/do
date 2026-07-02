'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ManagerService } from '@/services/manager';
import { ManagerDashboardStats } from '@/types';
import { OwnerProfile, Property, Booking, Complaint } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { QUERY_POLICY } from '@/config/queryPolicy';
import { Card, SkeletonLoader, StatusBadge, EmptyState } from '@/shared';
import {
  Users,
  Building2,
  CalendarCheck,
  AlertTriangle,
  CheckSquare,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ClipboardList,
  Search as SearchIcon,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const ManagerDashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const {
    data: stats,
    isLoading: loading,
    error,
    refetch: fetchStats,
  } = useQuery<ManagerDashboardStats>({
    queryKey: managerQueryKeys.dashboard,
    queryFn: ManagerService.getDashboardStats,
    refetchInterval: QUERY_POLICY.DASHBOARD_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  // Search state
  const [searchResults, setSearchResults] = useState<{
    owners: OwnerProfile[];
    properties: Property[];
    bookings: Booking[];
    complaints: Complaint[];
    tasks: any[];
  } | null>(null);
  const [searching, setSearching] = useState(false);

  const complaintDotClass = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized.includes('OPEN')) return 'bg-rose-400';
    if (normalized.includes('IN PROGRESS')) return 'bg-amber-400';
    if (normalized.includes('RESOLVED')) return 'bg-emerald-400';
    return 'bg-zinc-400';
  };

  useEffect(() => {
    if (searchQuery) {
      setSearching(true);
      ManagerService.searchAll(searchQuery)
        .then((res) => {
          setSearchResults(res);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-12 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader className="h-32 rounded-2xl" />
          <SkeletonLoader className="h-32 rounded-2xl" />
          <SkeletonLoader className="h-32 rounded-2xl" />
          <SkeletonLoader className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader className="h-80 rounded-2xl" />
          <SkeletonLoader className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive">Dashboard Data Unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {(error as Error)?.message || 'No dashboard data returned by backend.'}
          </p>
          <button
            onClick={() => fetchStats()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { totals, charts, recentActivities } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Operational Control Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Verify newly registered PG accounts, manage properties, tasks, and resolve complaints.'}
          </p>
        </div>
        {!searchQuery && (
          <button
            onClick={() => fetchStats()}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Refresh Stats
          </button>
        )}
      </div>

      {searchQuery ? (
        /* Global Search Results */
        searching ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Searching database...</p>
            </div>
          </div>
        ) : searchResults ? (
          <div className="space-y-8">
            {searchResults.owners.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-6 py-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Owners ({searchResults.owners.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {searchResults.owners.map((owner) => (
                    <div key={owner.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">{owner.user.first_name} {owner.user.last_name}</p>
                        <p className="text-xs text-muted-foreground">{owner.company_name || 'Individual'} &bull; {owner.user.email}</p>
                      </div>
                      <a
                        href={`/owners?id=${owner.id}`}
                        title="Open owner details"
                        aria-label="Open owner details"
                        className="rounded-lg border border-border p-2 hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.properties.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-6 py-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Properties ({searchResults.properties.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {searchResults.properties.map((prop) => (
                    <div key={prop.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">{prop.name}</p>
                        <p className="text-xs text-muted-foreground">{prop.address_line1}, {prop.city?.name}</p>
                      </div>
                      <a
                        href={`/properties?id=${prop.id}`}
                        title="Open property details"
                        aria-label="Open property details"
                        className="rounded-lg border border-border p-2 hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.bookings.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-6 py-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" /> Bookings ({searchResults.bookings.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {searchResults.bookings.map((booking) => (
                    <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">Tenant: {booking.tenant?.user.first_name} {booking.tenant?.user.last_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.bed?.room?.property?.name || 'No Property'} &bull; Room {booking.bed?.room?.room_number || 'N/A'}</p>
                      </div>
                      <a
                        href="/bookings"
                        title="Open bookings"
                        aria-label="Open bookings"
                        className="rounded-lg border border-border p-2 hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.complaints.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-6 py-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" /> Complaints ({searchResults.complaints.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {searchResults.complaints.map((comp) => (
                    <div key={comp.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">{comp.title}</p>
                        <p className="text-xs text-muted-foreground">Status: {comp.status} &bull; Priority: {comp.priority}</p>
                      </div>
                      <a
                        href="/complaints"
                        title="Open complaints"
                        aria-label="Open complaints"
                        className="rounded-lg border border-border p-2 hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.tasks.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-6 py-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" /> Tasks ({searchResults.tasks.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {searchResults.tasks.map((task) => (
                    <div key={task.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Priority: {task.priority} &bull; Status: {task.status}</p>
                      </div>
                      <a
                        href="/tasks"
                        title="Open tasks"
                        aria-label="Open tasks"
                        className="rounded-lg border border-border p-2 hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.owners.length === 0 &&
              searchResults.properties.length === 0 &&
              searchResults.bookings.length === 0 &&
              searchResults.complaints.length === 0 &&
              searchResults.tasks.length === 0 && (
                <EmptyState
                  title="No results found"
                  description={`No matches for "${searchQuery}" found in records.`}
                  icon={SearchIcon}
                />
              )}
          </div>
        ) : null
      ) : (
        /* Normal Operational Dashboard */
        <>
          {/* KPI cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-violet-500/10 blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Owners</span>
                <div className="rounded-lg bg-violet-500/10 p-2 text-violet-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">{totals.pendingOwners}</span>
                <span className="text-xs font-medium text-amber-500">verification queue</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Requires KYC documentation review</p>
            </Card>

            <Card>
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-blue-500/10 blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Properties</span>
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">{totals.pendingProperties}</span>
                <span className="text-xs font-medium text-amber-500">{totals.waitingApprovalProperties} waiting approval</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Rooms, layout, and photos review</p>
            </Card>

            <Card>
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-rose-500/10 blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Complaints</span>
                <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">{totals.openComplaints}</span>
                <span className="text-xs font-medium text-rose-500">Requires action</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Critical issue escalations active</p>
            </Card>

            <Card>
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-emerald-500/10 blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Tasks</span>
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                  <CheckSquare className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">{totals.assignedTasks}</span>
                <span className="text-xs font-medium text-emerald-500">{totals.todayCompletedTasks} completed today</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Avg. Resolution: {totals.avgVerificationTimeHours} hrs</p>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold text-base mb-6">Verification Trends</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.ownerVerificationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Bar dataKey="approved" name="Approved Owners" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending Verifications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base mb-2">Complaint Status Summary</h3>
                <p className="text-xs text-muted-foreground mb-6">Ticketing categorization for unresolved resident items.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="h-56 w-56 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.complaintStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {charts.complaintStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 w-full">
                  {charts.complaintStatus.map((c) => (
                    <div key={c.status} className="flex items-center justify-between border-b border-border/40 pb-1 text-sm">
                      <span className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
                        <span className={`h-2 w-2 rounded-full ${complaintDotClass(c.status)}`} />
                        {c.status}
                      </span>
                      <span className="font-bold text-xs">{c.count} tickets</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Activities Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 space-y-6">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Operational Activities Feed
              </h3>
              <div className="relative border-l border-border pl-6 ml-3 space-y-6">
                {recentActivities.map((act) => (
                  <div key={act.id} className="relative group">
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-card ring-4 ring-card bg-background transition-transform group-hover:scale-125">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-foreground">{act.title}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[10px] text-muted-foreground">{act.timestamp}</span>
                        {act.status && <StatusBadge status={act.status} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base mb-2">Task Completion Rate</h3>
                <p className="text-xs text-muted-foreground mb-6">Efficiency analysis for assigned operations.</p>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.taskCompletionRate} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Target Rate: <span className="font-semibold text-foreground">90%</span></span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> +6% this week
                </span>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
