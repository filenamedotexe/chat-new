'use client';

import { Card } from '@chat/ui';
import { TimelineCompact } from '@/features/timeline/components/timeline';
import { IconHistory } from '@tabler/icons-react';
import Link from 'next/link';
import type { ActivityLog } from '@/packages/database/src/schema/activity';

interface RecentActivityProps {
  activities: ActivityLog[];
  role: 'admin' | 'team_member' | 'client';
}

export function RecentActivity({ activities, role }: RecentActivityProps) {
  // Filter activities based on role
  const filteredActivities = activities.filter(activity => {
    // Admins see everything
    if (role === 'admin') return true;
    
    // Team members see task and project activities
    if (role === 'team_member') {
      return activity.entityType === 'task' || 
             activity.entityType === 'project' ||
             activity.entityType === 'file';
    }
    
    // Clients only see project and file activities
    if (role === 'client') {
      return activity.entityType === 'project' || 
             activity.entityType === 'file';
    }
    
    return false;
  });

  const displayActivities = filteredActivities.slice(0, 5);

  return (
    <Card className="p-6" data-testid="recent-activity">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconHistory className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        {role === 'admin' && (
          <Link 
            href="/admin/activity" 
            className="text-sm text-primary hover:underline"
          >
            View All
          </Link>
        )}
      </div>

      {displayActivities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <IconHistory className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <TimelineCompact activities={displayActivities} />
      )}
    </Card>
  );
}