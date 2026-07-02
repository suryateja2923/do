'use client';

import React, { useState, useEffect } from 'react';
import { ManagerService } from '@/services/manager';
import { ManagerTask } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { QUERY_POLICY } from '@/config/queryPolicy';
import { Card, SkeletonLoader, StatusBadge, EmptyState, Button } from '@/shared';
import { useFilters, useSearch } from '@/hooks/useShared';
import { formatDate } from '@/utils';
import {
  CheckSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export const TasksCenter: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading: loading,
    error,
    refetch: fetchTasks,
  } = useQuery<ManagerTask[]>({
    queryKey: managerQueryKeys.tasks,
    queryFn: ManagerService.getTasks,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });

  const [selectedTask, setSelectedTask] = useState<ManagerTask | null>(null);

  const { filters, updateFilter } = useFilters({
    status: 'ALL' as 'ALL' | ManagerTask['status'],
  });

  const { query: search, setQuery: setSearch, filteredItems: searchedTasks } = useSearch(tasks || [], [
    'title',
    'description',
    'priority',
  ]);

  // Actions states
  const [clarificationNotes, setClarificationNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status, clarificationNotes }: { id: string; status: ManagerTask['status']; clarificationNotes?: string }) =>
      ManagerService.updateTaskStatus(id, status, clarificationNotes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.tasks }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  useEffect(() => {
    setSelectedTask(null);
  }, [filters.status]);

  const handleUpdateStatus = async (status: ManagerTask['status']) => {
    if (!selectedTask) return;

    if (status === 'CLARIFICATION_REQUESTED' && !clarificationNotes.trim()) {
      toast.warning('Clarification notes required', { description: 'Please explain what needs clarification.' });
      return;
    }

    setSubmittingAction(true);
    try {
      await updateTaskMutation.mutateAsync({ id: selectedTask.id, status, clarificationNotes });
      toast.success(`Task status updated to ${status}`);
      fetchTasks();
      setSelectedTask(null);
    } catch (err: any) {
      toast.error('Failed to update task status', {
        description: err?.message || 'Server rejected task status update.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredTasks = searchedTasks.filter((t) => {
    return filters.status === 'ALL' || t.status === filters.status;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLARIFICATION_REQUESTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateFilter('status', s)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                filters.status === s
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Clock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
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
            <EmptyState title="Failed To Load Tasks" description={error} icon={AlertTriangle} />
          ) : filteredTasks.length === 0 ? (
            <EmptyState title="No Tasks found" description="You have no tasks matching the selected filters." icon={CheckSquare} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`rounded-2xl border p-5 bg-card shadow-sm cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden group ${
                    selectedTask?.id === task.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{task.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Due: {formatDate(task.due_date)}
                      </p>
                    </div>
                    <StatusBadge status={task.priority} type="priority" />
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{task.description}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>
                      Status: <span className="font-bold text-foreground">{task.status.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Card */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <Card className="sticky top-24 max-h-[85vh] overflow-y-auto animate-in fade-in duration-200 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base">Task File</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Task ID: {selectedTask.id}</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Details summary */}
              <div className="space-y-3 bg-muted/20 border border-border/30 rounded-xl p-4 text-xs">
                <p className="font-bold text-foreground">{selectedTask.title}</p>
                <p className="text-muted-foreground mt-2 leading-relaxed">{selectedTask.description}</p>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-border/40">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Priority</span>
                    <span className="font-bold text-foreground text-xs">{selectedTask.priority}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Due Date</span>
                    <span className="font-bold text-foreground text-xs">{formatDate(selectedTask.due_date)}</span>
                  </div>
                </div>
              </div>

              {/* Clarification notes display */}
              {selectedTask.clarification_notes && (
                <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl p-4 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 shrink-0" /> Clarification Note Sent
                  </p>
                  <p className="text-[10px] italic leading-relaxed">{selectedTask.clarification_notes}</p>
                </div>
              )}

              {/* Action buttons */}
              {selectedTask.status !== 'COMPLETED' && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Clarification Notes</label>
                    <textarea
                      placeholder="Detail questions or clarifications required from administrators..."
                      value={clarificationNotes}
                      onChange={(e) => setClarificationNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedTask.status === 'PENDING' && (
                      <Button onClick={() => handleUpdateStatus('IN_PROGRESS')} isLoading={submittingAction}>
                        <Play className="h-4 w-4" /> Accept Task
                      </Button>
                    )}
                    {(selectedTask.status === 'PENDING' ||
                      selectedTask.status === 'IN_PROGRESS' ||
                      selectedTask.status === 'CLARIFICATION_REQUESTED') && (
                      <Button
                        onClick={() => handleUpdateStatus('COMPLETED')}
                        isLoading={submittingAction}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        <CheckCircle className="h-4 w-4" /> Complete Task
                      </Button>
                    )}
                    {selectedTask.status !== 'CLARIFICATION_REQUESTED' && (
                      <Button
                        onClick={() => handleUpdateStatus('CLARIFICATION_REQUESTED')}
                        variant="outline"
                        isLoading={submittingAction}
                      >
                        <HelpCircle className="h-4 w-4 text-primary" /> Request Clarification
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground space-y-2 sticky top-24">
              <CheckSquare className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Operational Tasks Queue</h4>
              <p className="text-xs">
                Select a chore or document audit task to accept, submit resolution completions, or ask questions from
                admins.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksCenter;
