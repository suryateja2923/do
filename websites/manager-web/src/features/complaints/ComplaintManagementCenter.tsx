'use client';

import React, { useState, useEffect } from 'react';
import { ManagerService } from '@/services/manager';
import { Complaint } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { QUERY_POLICY } from '@/config/queryPolicy';
import { Card, SkeletonLoader, StatusBadge, EmptyState, Button } from '@/shared';
import { useFilters, useSearch } from '@/hooks/useShared';
import { formatDate } from '@/utils';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Calendar,
  UserCheck,
  Send,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export const ComplaintManagementCenter: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: complaints = [],
    isLoading: loading,
    error,
    refetch: fetchComplaints,
  } = useQuery<Complaint[]>({
    queryKey: managerQueryKeys.complaints,
    queryFn: ManagerService.getComplaints,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const { filters, updateFilter } = useFilters({
    status: 'ALL' as 'ALL' | Complaint['status'],
  });

  const { query: search, setQuery: setSearch, filteredItems: searchedComplaints } = useSearch(complaints || [], [
    'title',
    'description',
  ]);

  // Actions states
  const [commentText, setCommentText] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: Complaint['status']; notes: string }) =>
      ManagerService.updateComplaintStatus(id, status, notes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.complaints }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  const assignComplaintMutation = useMutation({
    mutationFn: ({ id, staffName }: { id: string; staffName: string }) =>
      ManagerService.assignComplaint(id, staffName),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.complaints }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  useEffect(() => {
    setSelectedComplaint(null);
  }, [filters.status]);

  const handleUpdateStatus = async (status: Complaint['status']) => {
    if (!selectedComplaint) return;
    if (!commentText.trim()) {
      toast.warning('Notes required', { description: 'Please explain status transition in comments.' });
      return;
    }

    setSubmittingAction(true);
    try {
      await updateComplaintMutation.mutateAsync({ id: selectedComplaint.id, status, notes: commentText });
      toast.success(`Complaint status updated to ${status}`);
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (err: any) {
      toast.error('Failed to update complaint status', {
        description: err?.message || 'Server rejected complaint status update.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedComplaint) return;
    if (!assigneeName.trim()) {
      toast.warning('Assignee required', { description: 'Please enter field staff or contractor name.' });
      return;
    }

    setSubmittingAction(true);
    try {
      await assignComplaintMutation.mutateAsync({ id: selectedComplaint.id, staffName: assigneeName });
      toast.success(`Complaint assigned to ${assigneeName}`);
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (err: any) {
      toast.error('Failed to assign complaint', {
        description: err?.message || 'Server rejected complaint assignment.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredComplaints = searchedComplaints.filter((c) => {
    const matchesStatus = filters.status === 'ALL' || c.status === filters.status;
    return matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
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
        <div className="relative w-full md:w-80">
          <Clock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
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
            <EmptyState title="Failed To Load Complaints" description={error} icon={AlertTriangle} />
          ) : filteredComplaints.length === 0 ? (
            <EmptyState title="No Complaints found" description="No resident complaints logged." icon={AlertTriangle} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`rounded-2xl border p-5 bg-card shadow-sm cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden group ${
                    selectedComplaint?.id === c.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{c.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        Category: {c.category}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{c.description}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>Priority: <span className="font-bold text-foreground">{c.priority}</span></span>
                    <span>Filed: {formatDate(c.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Card */}
        <div className="lg:col-span-1">
          {selectedComplaint ? (
            <Card className="sticky top-24 max-h-[85vh] overflow-y-auto animate-in fade-in duration-200 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base">Complaint Ticket File</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Ticket ID: {selectedComplaint.id}</p>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Resident details */}
              <div className="space-y-3 bg-muted/20 border border-border/30 rounded-xl p-4 text-xs">
                <p className="font-bold text-foreground">Resident Details</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold text-foreground">
                    {selectedComplaint.tenant?.user.first_name} {selectedComplaint.tenant?.user.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-semibold text-foreground">
                    {selectedComplaint.tenant?.user.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {selectedComplaint.property?.name}
                  </span>
                </div>
              </div>

              {/* Action Form */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Assign Ticket</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter contractor / field staff name..."
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                    <Button onClick={handleAssign} isLoading={submittingAction} className="h-9">
                      <UserCheck className="h-4 w-4" /> Assign
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Action Comment / Notes</label>
                  <textarea
                    placeholder="Provide details on resolution or ticket progress..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateStatus('IN_PROGRESS')} isLoading={submittingAction} className="flex-1">
                    <Clock className="h-4 w-4" /> In Progress
                  </Button>
                  <Button onClick={() => handleUpdateStatus('RESOLVED')} isLoading={submittingAction} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                    <CheckCircle className="h-4 w-4" /> Resolve
                  </Button>
                </div>
                <Button onClick={() => handleUpdateStatus('CLOSED')} variant="outline" isLoading={submittingAction} className="w-full">
                  <XCircle className="h-4 w-4" /> Close Ticket
                </Button>
              </div>
            </Card>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground space-y-2 sticky top-24">
              <AlertTriangle className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Complaint Operations</h4>
              <p className="text-xs">Select a resident complaint from listing to assign workers, track timeline updates, and resolve/close tickets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintManagementCenter;
