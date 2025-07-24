'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCard } from './task-card';
import { Card } from '@chat/ui';
import { IconClipboardList } from '@tabler/icons-react';
import type { TaskStatus } from '../data/tasks';

interface Task {
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
}

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function TaskList({ 
  tasks, 
  onTaskClick, 
  onStatusChange, 
  emptyMessage = 'No tasks yet',
  loading = false 
}: TaskListProps) {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const router = useRouter();

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('not_started')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'not_started'
              ? 'bg-gray-600 text-white'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          Not Started ({statusCounts.not_started || 0})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'in_progress'
              ? 'bg-blue-600 text-white'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          In Progress ({statusCounts.in_progress || 0})
        </button>
        <button
          onClick={() => setFilter('needs_review')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'needs_review'
              ? 'bg-yellow-600 text-white'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          Needs Review ({statusCounts.needs_review || 0})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'done'
              ? 'bg-green-600 text-white'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          Done ({statusCounts.done || 0})
        </button>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <IconClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick ? onTaskClick(task) : router.push(`/tasks/${task.id}`)}
              onStatusChange={
                onStatusChange
                  ? (status) => onStatusChange(task.id, status)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}