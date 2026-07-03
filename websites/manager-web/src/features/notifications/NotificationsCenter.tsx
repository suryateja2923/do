'use client';

import React, { useMemo, useRef, useState } from 'react';
import { ManagerService } from '@/services/manager';
import { OwnerProfile } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { QUERY_POLICY } from '@/config/queryPolicy';
import { Card, Button } from '@/shared';
import { Bell, Send, Megaphone, Check, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationsCenter: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: owners = [] } = useQuery<OwnerProfile[]>({
    queryKey: managerQueryKeys.owners,
    queryFn: ManagerService.getOwners,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  // Direct alert states
  const [targetUser, setTargetUser] = useState('');
  const [selectedOwnerLabel, setSelectedOwnerLabel] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [directTitle, setDirectTitle] = useState('');
  const [directMessage, setDirectMessage] = useState('');

  const ownerSuggestions = useMemo(() => {
    const query = targetUser.trim().toLowerCase();
    if (!query) return owners.slice(0, 8);
    return owners
      .filter((owner) => {
        const haystack = [
          owner.user?.first_name,
          owner.user?.last_name,
          owner.user?.email,
          owner.company_name,
          owner.user_id,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [owners, targetUser]);

  // Announcement states
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const [submittingDirect, setSubmittingDirect] = useState(false);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  const sendNotificationMutation = useMutation({
    mutationFn: ({ userId, title, content }: { userId: string; title: string; content: string }) =>
      ManagerService.sendNotification(userId, title, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard });
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      ManagerService.broadcastAnnouncement(title, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard });
    },
  });

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !directTitle || !directMessage) {
      toast.warning('All fields required');
      return;
    }

    setSubmittingDirect(true);
    try {
      await sendNotificationMutation.mutateAsync({ userId: targetUser, title: directTitle, content: directMessage });
      toast.success('Alert sent successfully');
      setTargetUser('');
      setSelectedOwnerLabel(null);
      setDirectTitle('');
      setDirectMessage('');
    } catch (err: any) {
      toast.error('Failed to send direct alert', {
        description: err?.message || 'Server rejected notification dispatch.',
      });
    } finally {
      setSubmittingDirect(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      toast.warning('All fields required');
      return;
    }

    setSubmittingBroadcast(true);
    try {
      await broadcastMutation.mutateAsync({ title: broadcastTitle, content: broadcastMessage });
      toast.success('Broadcast announcement posted');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      toast.error('Failed to broadcast announcement', {
        description: err?.message || 'Server rejected broadcast dispatch.',
      });
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Targeted alerts */}
      <Card className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Direct Owner Alert</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Send targeted action notifications directly to specific PG owners.</p>
          </div>
        </div>

        <form onSubmit={handleSendDirect} className="space-y-4 text-xs">
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-muted-foreground">Recipient User ID</label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => {
                setTargetUser(e.target.value);
                setSelectedOwnerLabel(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // delay so a click on a suggestion registers before the list unmounts
                suggestionsBlurTimeout.current = setTimeout(() => setShowSuggestions(false), 150);
              }}
              placeholder="Search PG owners by name, email, or paste a user id..."
              autoComplete="off"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary"
            />
            {selectedOwnerLabel && (
              <p className="text-[11px] text-primary flex items-center gap-1 pt-0.5">
                <Check className="h-3 w-3" /> {selectedOwnerLabel}
              </p>
            )}
            {showSuggestions && ownerSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
                {ownerSuggestions.map((owner) => {
                  const name = [owner.user?.first_name, owner.user?.last_name].filter(Boolean).join(' ') || 'Unnamed owner';
                  return (
                    <button
                      key={owner.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (suggestionsBlurTimeout.current) clearTimeout(suggestionsBlurTimeout.current);
                        setTargetUser(owner.user_id);
                        setSelectedOwnerLabel(`${name} · ${owner.user?.email ?? 'no email'}`);
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-primary/10 border-b border-border last:border-b-0"
                    >
                      <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <UserIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{owner.user?.email ?? owner.user_id}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Alert Title</label>
            <input
              type="text"
              placeholder="e.g. Action Required: Revoked PAN Document"
              value={directTitle}
              onChange={(e) => setDirectTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Alert Message</label>
            <textarea
              placeholder="Provide context and detail instructions on action items required..."
              value={directMessage}
              onChange={(e) => setDirectMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button type="submit" isLoading={submittingDirect} className="w-full">
            <Send className="h-4 w-4" /> Send Target Alert
          </Button>
        </form>
      </Card>

      {/* Broadcast Announcements */}
      <Card className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Broadcast Announcement</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Publish general policy warnings or updates to all registered PG owners.</p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Announcement Title</label>
            <input
              type="text"
              placeholder="e.g. Policy Update: Mandatory Fire Safety Audits"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Announcement Content</label>
            <textarea
              placeholder="Write announcement body details..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={7}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button type="submit" isLoading={submittingBroadcast} className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/15">
            <Megaphone className="h-4 w-4" /> Broadcast Announcement
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default NotificationsCenter;
