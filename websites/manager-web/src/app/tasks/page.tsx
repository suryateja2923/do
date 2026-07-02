'use client';

import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TasksCenter from '@/features/tasks/TasksCenter';

export default function TasksPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Task Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track operational chores, audit queues, and confirm task statuses assigned by administrators.
          </p>
        </div>
        <TasksCenter />
      </div>
    </DashboardLayout>
  );
}
