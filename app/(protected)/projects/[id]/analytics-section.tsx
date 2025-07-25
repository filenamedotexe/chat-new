'use client';

import { Card } from '@chat/ui';
import { IconTrendingUp, IconClock, IconUsers, IconTarget } from '@tabler/icons-react';
import { format, differenceInDays } from 'date-fns';
import type { Project } from '@chat/shared-types';
import type { ProjectProgress } from '@/features/progress/lib/calculate-progress';

interface AnalyticsSectionProps {
  project: Project;
  progress: ProjectProgress;
}

export function AnalyticsSection({ project, progress }: AnalyticsSectionProps) {
  const daysActive = project.startDate 
    ? differenceInDays(new Date(), new Date(project.startDate))
    : 0;
  
  const completionRate = progress.totalTasks > 0 
    ? ((progress.completedTasks / progress.totalTasks) * 100).toFixed(1)
    : '0';
    
  const estimatedCompletion = project.startDate && project.endDate && progress.progressPercentage > 0
    ? format(new Date(project.endDate), 'MMM d, yyyy')
    : 'Not available';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <IconTrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-xl font-semibold">{completionRate}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <IconClock className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Days Active</p>
            <p className="text-xl font-semibold">{daysActive}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <IconUsers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Tasks</p>
            <p className="text-xl font-semibold">{progress.inProgressTasks}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <IconTarget className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Est. Completion</p>
            <p className="text-sm font-semibold">{estimatedCompletion}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}