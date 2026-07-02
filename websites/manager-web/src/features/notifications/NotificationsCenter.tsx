'use client';

import React, { useState } from 'react';
import { ManagerService } from '@/services/manager';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { Card, Button } from '@/shared';
import { Bell, Send, Megaphone, Check } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationsCenter: React.FC = () => {
  const queryClient = useQueryClient();

  // Direct alert states
  const [targetUser, setTargetUser] = useState('');
  const [directTitle, setDirectTitle] = useState('');
  const [directMessage, setDirectMessage] = useState('');

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
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Recipient User ID</label>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="Enter owner/user id from live records..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary"
            />
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
