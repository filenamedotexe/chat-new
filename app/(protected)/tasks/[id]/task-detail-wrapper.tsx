'use client';

import { useRouter } from 'next/navigation';
import { TaskDetail } from '@/features/tasks/components/task-detail';
import type { TaskStatus } from '@/features/tasks/data/tasks';

interface TaskDetailWrapperProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    dueDate?: Date | string | null;
    assignee?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    project: {
      id: string;
      name: string;
    };
    createdBy: {
      id: string;
      name: string | null;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    fileCount?: number;
  };
  canEdit: boolean;
}

export function TaskDetailWrapper({ task, canEdit }: TaskDetailWrapperProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleTaskUpdate = () => {
    router.refresh();
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        // Show success message (you could use a toast here)
        alert(result.message || 'Status updated successfully');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating status');
    }
  };

  return (
    <TaskDetail
      task={task}
      canEdit={canEdit}
      onBack={handleBack}
      onTaskUpdate={handleTaskUpdate}
      onStatusChange={handleStatusChange}
    />
  );
}