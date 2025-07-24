'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@chat/ui';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconCalendar, 
  IconUser, 
  IconClock,
  IconFlag,
  IconPaperclip,
  IconPlus,
  IconTrash,
  IconMessage
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { FileUpload } from '@/features/files/components/file-upload';
import { FileList } from '@/features/files/components/file-list';
import { TaskCard } from './task-card';
import type { TaskStatus } from '../data/tasks';

interface TaskWithDetails {
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
}

interface TaskDetailProps {
  task: TaskWithDetails;
  onStatusChange?: (status: TaskStatus) => void;
  onTaskUpdate?: () => void;
  onBack?: () => void;
  canEdit?: boolean;
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    icon: IconClock,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: IconClock,
  },
  needs_review: {
    label: 'Needs Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: IconFlag,
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: IconFlag,
  },
};

export function TaskDetail({ 
  task, 
  onStatusChange, 
  onTaskUpdate, 
  onBack, 
  canEdit = true 
}: TaskDetailProps) {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileListKey, setFileListKey] = useState(0);
  
  const status = statusConfig[task.status];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const StatusIcon = status.icon;

  const handleFileUploadComplete = () => {
    setShowFileUpload(false);
    setFileListKey(prev => prev + 1); // Force file list refresh
    onTaskUpdate?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>Project: {task.project.name}</span>
              <span>•</span>
              <span>Created {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
              {task.createdBy && (
                <>
                  <span>•</span>
                  <span>by {task.createdBy.name || task.createdBy.email}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => window.location.href = `/tasks/${task.id}/chat`}
          >
            <IconMessage className="h-4 w-4 mr-2" />
            Discussion
          </Button>
          {canEdit && (
            <>
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/tasks/${task.id}/edit`}
              >
                <IconEdit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
              <Button 
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    try {
                      const response = await fetch(`/api/tasks/${task.id}`, {
                        method: 'DELETE',
                      });
                      if (response.ok) {
                        window.location.href = `/projects/${task.project.id}/tasks`;
                      } else {
                        alert('Failed to delete task');
                      }
                    } catch (error) {
                      alert('Error deleting task');
                    }
                  }
                }}
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Task Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            {task.description ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </Card>

          {/* Files Section */}
          <Card className="p-6" data-testid="attachments-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconPaperclip className="h-5 w-5" />
                Attachments
                {task.fileCount && task.fileCount > 0 && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full" data-testid="file-count">
                    {task.fileCount}
                  </span>
                )}
              </h2>
              
              {canEdit && !showFileUpload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                  data-testid="add-files-button"
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Files
                </Button>
              )}
            </div>

            {showFileUpload && (
              <div className="mb-6">
                <FileUpload
                  taskId={task.id}
                  projectId={task.project.id}
                  onUploadComplete={handleFileUploadComplete}
                  onUploadError={(error) => {
                    console.error('File upload error:', error);
                    alert('Failed to upload files: ' + error);
                  }}
                  maxFiles={10}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUpload(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <FileList
              key={fileListKey}
              taskId={task.id}
              onFileDeleted={() => {
                setFileListKey(prev => prev + 1);
                onTaskUpdate?.();
              }}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Status</h3>
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </div>
              
              {onStatusChange && canEdit && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm text-muted-foreground">Change status:</p>
                  <div className="flex flex-wrap gap-2">
                    {task.status === 'not_started' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange('in_progress')}
                      >
                        Start Task
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange('needs_review')}
                        >
                          Submit for Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange('not_started')}
                        >
                          Stop
                        </Button>
                      </>
                    )}
                    {task.status === 'needs_review' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange('done')}
                        >
                          Mark Done
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange('in_progress')}
                        >
                          Back to Progress
                        </Button>
                      </>
                    )}
                    {task.status === 'done' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange('needs_review')}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Details Card */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Details</h3>
            <div className="space-y-3">
              {/* Assignee */}
              <div className="flex items-center gap-2 text-sm">
                <IconUser className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Assignee:</span>
                <span className="font-medium">
                  {task.assignee ? (task.assignee.name || task.assignee.email) : 'Unassigned'}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 text-sm">
                <IconCalendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Due date:</span>
                <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                  {isOverdue && <span className="text-red-600 ml-1">(Overdue)</span>}
                </span>
              </div>

              {/* Created */}
              <div className="flex items-center gap-2 text-sm">
                <IconClock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {format(new Date(task.createdAt), 'MMM d, yyyy')}
                </span>
              </div>

              {/* Updated */}
              {task.updatedAt !== task.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <IconClock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">
                    {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}