'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ManagerService } from '@/services/manager';
import { VerificationHistoryItem } from '@/types';
import { OwnerProfile } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { QUERY_POLICY } from '@/config/queryPolicy';
import { Card, SkeletonLoader, StatusBadge, EmptyState, Button } from '@/shared';
import { useFilters, useSearch } from '@/hooks/useShared';
import { formatDate } from '@/utils';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  Info,
  Calendar,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export const OwnerVerificationCenter: React.FC = () => {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');
  const queryClient = useQueryClient();

  const {
    data: owners = [],
    isLoading: loading,
    error,
    refetch: fetchOwners,
  } = useQuery<OwnerProfile[]>({
    queryKey: managerQueryKeys.owners,
    queryFn: ManagerService.getOwners,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });
  const [selectedOwner, setSelectedOwner] = useState<OwnerProfile | null>(null);
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { filters, updateFilter } = useFilters({
    status: 'ALL' as 'ALL' | OwnerProfile['kyc_status'],
  });

  const { query: search, setQuery: setSearch, filteredItems: searchedOwners } = useSearch(owners || [], [
    'company_name',
  ]);

  // Actions states
  const [notes, setNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [requestedDocs, setRequestedDocs] = useState<string[]>([]);
  const docOptions = ['PAN Card', 'GST Registration certificate', 'Property Ownership Deed', 'Electricity Bill'];

  const verifyOwnerMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: OwnerProfile['kyc_status']; notes: string }) =>
      ManagerService.verifyOwner(id, status, notes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.owners }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  const requestDocsMutation = useMutation({
    mutationFn: ({ id, docs, notes }: { id: string; docs: string[]; notes: string }) =>
      ManagerService.requestOwnerDocuments(id, docs, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerQueryKeys.owners });
    },
  });

  const suspendOwnerMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => ManagerService.suspendOwner(id, notes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.owners }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  useEffect(() => {
    if (initialId && owners && owners.length > 0) {
      const owner = owners.find((o) => o.id === initialId);
      if (owner) handleSelectOwner(owner);
    }
  }, [initialId, owners]);

  const openDocument = (url: string) => {
    if (url.startsWith('data:')) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSelectOwner = (owner: OwnerProfile) => {
    setSelectedOwner(owner);
    setHistoryLoading(true);
    setNotes('');
    setRequestedDocs([]);
    ManagerService.getVerificationHistory(owner.id)
      .then((hist) => {
        setHistory(hist);
        setHistoryLoading(false);
      })
      .catch((err: any) => {
        setHistoryLoading(false);
        toast.error('Failed to load verification history', {
          description: err?.message || 'Server rejected history request.',
        });
      });
  };

  const handleVerify = async (status: OwnerProfile['kyc_status']) => {
    if (!selectedOwner) return;
    if (!notes.trim()) {
      toast.warning('Notes required', { description: 'Please enter feedback before submitting.' });
      return;
    }

    setSubmittingAction(true);
    try {
      await verifyOwnerMutation.mutateAsync({ id: selectedOwner.id, status, notes });
      toast.success(`Owner status updated to ${status}`);
      fetchOwners();
      setSelectedOwner(null);
    } catch (err: any) {
      toast.error('Failed to update owner status', {
        description: err?.message || 'Server rejected verification update.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRequestDocs = async () => {
    if (!selectedOwner) return;
    if (requestedDocs.length === 0) {
      toast.warning('Select documents');
      return;
    }
    if (!notes.trim()) {
      toast.warning('Notes required');
      return;
    }

    setSubmittingAction(true);
    try {
      await requestDocsMutation.mutateAsync({ id: selectedOwner.id, docs: requestedDocs, notes });
      toast.success('Document request sent');
      setSelectedOwner(null);
    } catch (err: any) {
      toast.error('Failed to request documents', {
        description: err?.message || 'Server rejected document request.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedOwner) return;
    if (!notes.trim()) {
      toast.warning('Suspension notes required');
      return;
    }

    setSubmittingAction(true);
    try {
      await suspendOwnerMutation.mutateAsync({ id: selectedOwner.id, notes });
      toast.success('Owner temporarily suspended');
      fetchOwners();
      setSelectedOwner(null);
    } catch (err: any) {
      toast.error('Failed to suspend owner', {
        description: err?.message || 'Server rejected suspension request.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredOwners = searchedOwners.filter((o) => {
    return filters.status === 'ALL' || o.kyc_status === filters.status;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const).map((s) => (
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
            placeholder="Search owners by company..."
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
            <EmptyState title="Failed To Load Owners" description={error} icon={AlertTriangle} />
          ) : filteredOwners.length === 0 ? (
            <EmptyState title="No Owners found" description="No accounts match current selection filters." icon={Users} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOwners.map((owner) => (
                <div
                  key={owner.id}
                  onClick={() => handleSelectOwner(owner)}
                  className={`rounded-2xl border p-5 bg-card shadow-sm cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden group ${
                    selectedOwner?.id === owner.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {owner.user.first_name} {owner.user.last_name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{owner.company_name || 'Individual'}</p>
                    </div>
                    <StatusBadge status={owner.kyc_status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>Registered properties: {owner._count?.properties || 0}</span>
                    <span>Joined: {formatDate(owner.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Card */}
        <div className="lg:col-span-1">
          {selectedOwner ? (
            <Card className="sticky top-24 max-h-[85vh] overflow-y-auto animate-in fade-in duration-200 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {selectedOwner.user.profile_image?.url ? (
                    <img
                      src={selectedOwner.user.profile_image.url}
                      alt="Profile"
                      className="h-10 w-10 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      {selectedOwner.user.first_name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-base">
                      {selectedOwner.user.first_name} {selectedOwner.user.last_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{selectedOwner.company_name || 'Individual owner'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOwner(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Owner Info */}
              <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border/30">
                <div className="flex items-center gap-2 text-xs">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-muted-foreground">Contact:</span>
                  <span className="font-semibold text-foreground truncate">{selectedOwner.user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-muted-foreground">Email:</span>
                  <span className="font-semibold text-foreground truncate">{selectedOwner.user.email}</span>
                </div>
                {selectedOwner.gst_number && (
                  <div className="flex items-center gap-2 text-xs">
                    <Info className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium text-muted-foreground">GSTIN:</span>
                    <span className="font-semibold text-foreground">{selectedOwner.gst_number}</span>
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Submitted Verification Files</h4>
                {selectedOwner.owner_documents && selectedOwner.owner_documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOwner.owner_documents.map((doc: any) => {
                      const docUrl = doc.url && (doc.url.startsWith('http') || doc.url.startsWith('/') || doc.url.startsWith('data:')) ? doc.url : `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => openDocument(docUrl)}
                          className="w-full text-left rounded-xl border border-border p-3 flex items-center justify-between text-xs hover:bg-muted/10 transition-colors"
                        >
                          <span className="flex items-center gap-2 font-medium truncate pr-4">
                            <FileText className="h-4 w-4 text-primary shrink-0" /> {doc.type.replace('_', ' ')}
                          </span>
                          <span className="text-primary hover:underline text-[10px] font-bold shrink-0">Open</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => openDocument("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")}
                      className="w-full text-left rounded-xl border border-border p-3 flex items-center justify-between text-xs hover:bg-muted/10 transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4 text-primary" /> Permanent Account Number (PAN)
                      </span>
                      <span className="text-primary hover:underline text-[10px] font-bold">Open</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openDocument("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")}
                      className="w-full text-left rounded-xl border border-border p-3 flex items-center justify-between text-xs hover:bg-muted/10 transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Building className="h-4 w-4 text-indigo-500" /> Certificate of Incorporation
                      </span>
                      <span className="text-primary hover:underline text-[10px] font-bold">Open</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Decision Panel */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Decision Notes</label>
                  <textarea
                    placeholder="Feedback or audit justification..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Additional Info Request */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Request Additional Info</label>
                  <div className="grid grid-cols-2 gap-2">
                    {docOptions.map((doc) => {
                      const isSelected = requestedDocs.includes(doc);
                      return (
                        <button
                          key={doc}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setRequestedDocs(requestedDocs.filter((d) => d !== doc));
                            } else {
                              setRequestedDocs([...requestedDocs, doc]);
                            }
                          }}
                          className={`rounded-lg border p-2 text-[10px] font-semibold text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          {doc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button onClick={() => handleVerify('APPROVED')} isLoading={submittingAction} className="flex-1">
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={() => handleVerify('REJECTED')} variant="destructive" isLoading={submittingAction} className="flex-1">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRequestDocs} variant="outline" isLoading={submittingAction} className="flex-1">
                    <Send className="h-3.5 w-3.5" /> Request Docs
                  </Button>
                  <Button onClick={handleSuspend} variant="ghost" isLoading={submittingAction} className="flex-1 border border-border text-amber-500 hover:bg-amber-500/10">
                    <AlertTriangle className="h-3.5 w-3.5" /> Suspend
                  </Button>
                </div>
              </div>

              {/* History logs */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Verification Timeline
                </h4>
                {historyLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No historical actions logged.</p>
                ) : (
                  <div className="relative border-l border-border pl-4 space-y-3 ml-2 text-[10px]">
                    {history.map((hist) => (
                      <div key={hist.id} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                        <div>
                          <span className="font-bold text-foreground">{hist.action}</span> &bull;{' '}
                          <span className="text-muted-foreground">{hist.actor_name}</span>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">{hist.notes}</p>
                          <span className="text-primary/70 block text-[9px] mt-0.5">
                            {formatDate(hist.timestamp, true)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground space-y-2 sticky top-24">
              <Users className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Evaluate Owner Files</h4>
              <p className="text-xs">Select an owner from listing to view KYC details, previous actions, and verify their status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerVerificationCenter;
