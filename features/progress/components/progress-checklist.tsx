'use client';

import { useState } from 'react';
import { 
  IconCheck, 
  IconClock, 
  IconAlertCircle, 
  IconCircleDashed,
  IconChevronDown,
  IconChevronRight
} from '@tabler/icons-react';
import type { ProjectProgress } from '../lib/calculate-progress';

interface ProgressChecklistProps {
  progress: ProjectProgress;
  projectName?: string;
  showRules?: boolean;
  className?: string;
}

interface TaskStatusItem {
  label: string;
  count: number;
  total: number;
  status: 'complete' | 'in-progress' | 'pending' | 'review';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function ProgressChecklist({ 
  progress, 
  projectName,
  showRules = true,
  className = '' 
}: ProgressChecklistProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusItems: TaskStatusItem[] = [
    {
      label: 'Tasks Completed',
      count: progress.completedTasks,
      total: progress.totalTasks,
      status: 'complete',
      icon: IconCheck,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Tasks In Progress',
      count: progress.inProgressTasks,
      total: progress.totalTasks,
      status: 'in-progress',
      icon: IconClock,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Tasks In Review',
      count: progress.needsReviewTasks,
      total: progress.totalTasks,
      status: 'review',
      icon: IconAlertCircle,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      label: 'Tasks Not Started',
      count: progress.notStartedTasks,
      total: progress.totalTasks,
      status: 'pending',
      icon: IconCircleDashed,
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  const completionRules = [
    'All tasks must be marked as "Done" for the project to be complete',
    'Tasks in "Needs Review" status are not considered complete',
    'Progress percentage is based on the ratio of completed tasks to total tasks',
    'Projects with no tasks show 0% progress'
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {projectName ? `${projectName} Progress` : 'Project Progress'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {progress.isComplete 
              ? '🎉 Project is complete!' 
              : `${progress.completedTasks} of ${progress.totalTasks} tasks completed`
            }
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {progress.progressPercentage}%
          </div>
          {progress.isComplete && (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Progress Items */}
      <div className="space-y-3">
        {statusItems.map((item) => {
          const Icon = item.icon;
          const percentage = progress.totalTasks > 0 
            ? Math.round((item.count / progress.totalTasks) * 100)
            : 0;

          return (
            <div key={item.label} className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${item.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.count} / {item.total} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      item.status === 'complete' ? 'bg-green-500' :
                      item.status === 'in-progress' ? 'bg-blue-500' :
                      item.status === 'review' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rules */}
      {showRules && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
            Completion Requirements
          </button>
          
          {showDetails && (
            <ul className="mt-3 space-y-2">
              {completionRules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-xs mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Motivational Messages */}
      {!progress.isComplete && progress.totalTasks > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm">
            {progress.progressPercentage >= 80 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Almost there! Just {progress.totalTasks - progress.completedTasks} more tasks to go! 🚀
              </span>
            ) : progress.progressPercentage >= 50 ? (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Great progress! You're over halfway done! 💪
              </span>
            ) : progress.progressPercentage >= 25 ? (
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                Good start! Keep the momentum going! 📈
              </span>
            ) : (
              <span className="text-muted-foreground">
                Every journey begins with a single step. Let's get started! 🏁
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Minimal version for dashboard widgets
export function MiniProgressChecklist({ progress }: { progress: ProjectProgress }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm font-bold">{progress.progressPercentage}%</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <IconCheck className="h-3 w-3 text-green-500" />
          <span>{progress.completedTasks} done</span>
        </div>
        <div className="flex items-center gap-1">
          <IconClock className="h-3 w-3 text-blue-500" />
          <span>{progress.inProgressTasks} active</span>
        </div>
        <div className="flex items-center gap-1">
          <IconAlertCircle className="h-3 w-3 text-yellow-500" />
          <span>{progress.needsReviewTasks} review</span>
        </div>
        <div className="flex items-center gap-1">
          <IconCircleDashed className="h-3 w-3 text-gray-500" />
          <span>{progress.notStartedTasks} pending</span>
        </div>
      </div>
    </div>
  );
}