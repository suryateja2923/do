'use client';

import React, { useState, useEffect } from 'react';
import { ManagerService } from '@/services/manager';
import { Card, SkeletonLoader, EmptyState, Button } from '@/shared';
import { useApi, useFilters, useSearch } from '@/hooks/useShared';
import { exportCSV } from '@/utils';
import { FileText, Search, Download, AlertTriangle, ShieldCheck, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

type ReportCategory = 'VERIFICATION' | 'COMPLAINTS' | 'OPERATIONAL' | 'PROPERTY';

const EMPTY_REPORTS: any[] = [];

export const ReportsCenter: React.FC = () => {
  const [category, setCategory] = useState<ReportCategory>('VERIFICATION');

  const { data: reports, loading, execute: fetchReports } = useApi(
    () => ManagerService.getReports(category),
    true
  );

  const { query: search, setQuery: setSearch, filteredItems: searchedReports } = useSearch(reports ?? EMPTY_REPORTS, [
    'type',
    'details',
    'status',
  ]);

  useEffect(() => {
    fetchReports();
  }, [category]);

  const handleExport = () => {
    if (!reports || reports.length === 0) {
      toast.warning('No reports to export');
      return;
    }
    exportCSV(reports || [], `${category.toLowerCase()}_reports`);
    toast.success('Report Export Initiated', {
      description: `CSV file prepared for ${category} category logs.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Export header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {(['VERIFICATION', 'COMPLAINTS', 'PROPERTY', 'OPERATIONAL'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                category === cat
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground'
                }`}
            >
              {cat.toLowerCase().replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
            />
          </div>
          <Button onClick={handleExport} className="h-9">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Reports Table Grid */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/20 px-6 py-4">
            <h3 className="font-bold text-sm">Report Log: {category}</h3>
          </div>

          {loading ? (
            <div className="p-12 space-y-4">
              <SkeletonLoader className="h-8 w-full" />
              <SkeletonLoader className="h-8 w-full" />
              <SkeletonLoader className="h-8 w-full" />
            </div>
          ) : searchedReports.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground italic">No reports found matching query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/10 text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Report Type</th>
                    <th className="p-4">Details Summary</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {searchedReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-mono">{rep.date}</td>
                      <td className="p-4 font-semibold">{rep.type}</td>
                      <td className="p-4 text-muted-foreground">{rep.details}</td>
                      <td className="p-4">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            rep.status === 'SUCCESS' || rep.status === 'APPROVED' || rep.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security alerts and restriction notes */}
        <div className="space-y-6">
          <Card className="flex flex-col gap-4">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" /> Permitted Access Grid
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As an operational assistant to the administrator, you are granted access to audit operations. Your dashboard exposes the following reporting scopes:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <ClipboardList className="h-4 w-4 shrink-0" /> Verification Reports
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <ClipboardList className="h-4 w-4 shrink-0" /> Complaint Status Audits
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <ClipboardList className="h-4 w-4 shrink-0" /> Property Approval Trends
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <ClipboardList className="h-4 w-4 shrink-0" /> Daily Activity Logs
              </div>
            </div>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5 space-y-4">
            <h4 className="font-bold text-sm text-rose-500 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 shrink-0" /> Restrictive Boundaries
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Managers are strictly blocked from requesting or compiling the following financial and configuration reports:
            </p>
            <div className="space-y-1.5 text-[10px] text-rose-400 font-semibold">
              <p>&bull; Monthly/Annual Revenue Summaries</p>
              <p>&bull; Owner Payouts & Gateway Fees</p>
              <p>&bull; Platform Subscriptions & Invoicing logs</p>
              <p>&bull; Platform configuration diagnostics</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
