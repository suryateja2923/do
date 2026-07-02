'use client';

import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { AdminService, DashboardStats } from '../services/admin';
import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from '../lib/queryKeys';
import { QUERY_POLICY } from '../config/queryPolicy';
import {
  Users,
  UserCheck,
  Building2,
  ShieldCheck,
  CalendarCheck,
  LayoutGrid,
  Bed,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: adminQueryKeys.dashboard,
    queryFn: AdminService.getDashboardStats,
    refetchInterval: QUERY_POLICY.DASHBOARD_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Compiling dashboard analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center px-6">
          <div className="max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">Dashboard Data Unavailable</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {(error as Error)?.message || 'No dashboard data returned by backend.'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { totals, charts, recentActivities } = stats;
  const occupancyPct = totals.beds > 0 ? ((totals.occupiedBeds / totals.beds) * 100) : 0;
  const vacancyPct = totals.beds > 0 ? ((totals.vacantBeds / totals.beds) * 100) : 0;

  const COLORS = ['#6366f1', '#e2e8f0'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">HomiePG coliving operations and diagnostic analytics.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Refresh Stats
            </button>
            <button
              onClick={() => (window.location.href = '/reports')}
              className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/95 transition-colors cursor-pointer shadow-lg shadow-primary/20"
            >
              Export Reports
            </button>
          </div>
        </div>

        {/* 1. logical metric grid summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Revenue */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-emerald-500/10 blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Revenue</span>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">₹{(totals.monthlyRevenue / 100000).toFixed(2)}L</span>
              <span className="text-xs font-medium text-emerald-500 flex items-center">
                +12% <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active pending bills: ₹{totals.pendingPayments.toLocaleString()}</p>
          </div>

          {/* Card 2: Occupancy Rate */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-indigo-500/10 blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bed Occupancy Rate</span>
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
                <Bed className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">
                {occupancyPct.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">({totals.occupiedBeds}/{totals.beds})</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Vacant rooms: {totals.vacantRooms} / {totals.rooms} total</p>
          </div>

          {/* Card 3: Properties */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-violet-500/10 blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PG Properties</span>
              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-500">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{totals.properties}</span>
              <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {totals.pendingProperties} pending
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Verified properties: {totals.verifiedProperties}</p>
          </div>

          {/* Card 4: Complaints */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-rose-500/10 blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unresolved Complaints</span>
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{totals.pendingComplaints}</span>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> {totals.resolvedComplaints} resolved
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active Bookings in system: {totals.activeBookings}</p>
          </div>
        </div>

        {/* 2. Mini quick stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">Total Owners</p>
            <p className="text-lg font-bold text-foreground mt-1">{totals.owners}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">Total Managers</p>
            <p className="text-lg font-bold text-foreground mt-1">{totals.managers}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-lg font-bold text-foreground mt-1">{totals.users}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">Total Rooms</p>
            <p className="text-lg font-bold text-foreground mt-1">{totals.rooms}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">Occupied Rooms</p>
            <p className="text-lg font-bold text-foreground mt-1 text-primary">{totals.occupiedRooms}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">Vacant Beds</p>
            <p className="text-lg font-bold text-foreground mt-1 text-emerald-500">{totals.vacantBeds}</p>
          </div>
        </div>

        {/* 3. Recharts Graphics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold">Monthly Revenue Trend</h3>
            <p className="text-xs text-muted-foreground mt-1">Growth of earnings over the last 6 months.</p>
            <div className="h-80 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#f4f4f5' }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy Share */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">Bed Occupancy Share</h3>
              <p className="text-xs text-muted-foreground mt-1">Percentage split of rented vs vacant spaces.</p>
            </div>
            <div className="h-60 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.occupancy}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.occupancy.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded bg-indigo-500" />
                <span>Rented ({occupancyPct.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded bg-slate-200 dark:bg-zinc-700" />
                <span>Vacant ({vacancyPct.toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Secondary Row: Growth and Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bookings Tracker */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold">Bookings Volume</h3>
            <p className="text-xs text-muted-foreground mt-1">Monthly frequency of confirmed check-ins.</p>
            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.bookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
                  <Bar dataKey="bookings" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User and Property Growth */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold">Growth Trends</h3>
            <p className="text-xs text-muted-foreground mt-1">Tenant signups vs Property registrations.</p>
            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
                  <Area type="monotone" dataKey="users" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="properties" stroke="#10b981" fill="rgba(16, 185, 129, 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. Activities and Quick Actions layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Operations */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold">Recent System Logs</h3>
            <p className="text-xs text-muted-foreground mt-1">Real-time trace entries of portal events.</p>
            <div className="mt-6 space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">{act.type.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium">{act.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">Quick Administration</h3>
              <p className="text-xs text-muted-foreground mt-1">Core shortcuts to manage PGs.</p>
            </div>
            <div className="mt-6 space-y-3 flex-1">
              <button
                onClick={() => (window.location.href = '/property-verification')}
                className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                <span>Verify Property Submissions</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-bold">
                  {totals.pendingProperties}
                </span>
              </button>
              <button
                onClick={() => (window.location.href = '/owners')}
                className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                <span>View Owner Accounts</span>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-500 font-bold">
                  {totals.owners}
                </span>
              </button>
              <button
                onClick={() => (window.location.href = '/complaints')}
                className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                <span>Resolve Pending Complaints</span>
                <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-500 font-bold">
                  {totals.pendingComplaints}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
