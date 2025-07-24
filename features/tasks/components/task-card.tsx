'use client';

import { Card } from '@chat/ui';
import { IconClock, IconUser, IconCalendar, IconPaperclip } from '@tabler/icons-react';
import { format } from 'date-fns';
import type { TaskStatus } from '../data/tasks';

interface TaskCardProps {
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
    fileCount?: number;
  };
  onClick?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  needs_review: {
    label: 'Needs Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
};

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const status = statusConfig[task.status];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid="task-card"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium line-clamp-2">{task.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}>
            {status.label}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <IconUser className="h-3 w-3" />
              <span>{task.assignee.name || task.assignee.email}</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
              <IconCalendar className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          
          {task.fileCount && task.fileCount > 0 && (
            <div className="flex items-center gap-1">
              <IconPaperclip className="h-3 w-3" data-testid="file-count-icon" />
              <span data-testid="file-count">{task.fileCount}</span>
            </div>
          )}
        </div>

        {onStatusChange && (
          <div className="flex gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
            {task.status === 'not_started' && (
              <button
                className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('in_progress');
                }}
              >
                Start Task
              </button>
            )}
            {task.status === 'in_progress' && (
              <>
                <button
                  className="text-xs px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('needs_review');
                  }}
                >
                  Submit for Review
                </button>
                <button
                  className="text-xs px-2 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('not_started');
                  }}
                >
                  Stop
                </button>
              </>
            )}
            {task.status === 'needs_review' && (
              <>
                <button
                  className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('done');
                  }}
                >
                  Mark Done
                </button>
                <button
                  className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange('in_progress');
                  }}
                >
                  Back to Progress
                </button>
              </>
            )}
            {task.status === 'done' && (
              <button
                className="text-xs px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('needs_review');
                }}
              >
                Reopen
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}