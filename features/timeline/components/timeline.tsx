'use client';

import React from 'react';
import { Card } from '@chat/ui';
import { formatDistanceToNow } from 'date-fns';
import { 
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowRight,
  IconUser,
  IconFile,
  IconMessage,
  IconBuilding,
  IconClipboardList,
  IconClock,
  IconDownload,
  IconShare
} from '@tabler/icons-react';
import type { ActivityLog } from '@/packages/database/src/schema/activity';

// Format activity message on client-side
function formatActivityMessage(activity: ActivityLog): string {
  const userName = activity.userName || 'Unknown user';
  
  switch (activity.action) {
    // Project actions
    case 'project_created':
      return `${userName} created project`;
    case 'project_updated':
      return `${userName} updated project`;
    case 'project_deleted':
      return `${userName} deleted project`;
    case 'project_status_changed':
      return `${userName} changed project status`;
      
    // Task actions
    case 'task_created':
      return `${userName} created task`;
    case 'task_updated':
      return `${userName} updated task`;
    case 'task_deleted':
      return `${userName} deleted task`;
    case 'task_status_changed':
      return `${userName} changed task status`;
    case 'task_assigned':
      return `${userName} assigned task`;
    case 'task_unassigned':
      return `${userName} unassigned task`;
      
    // File actions
    case 'file_uploaded':
      return `${userName} uploaded file`;
    case 'file_deleted':
      return `${userName} deleted file`;
    case 'file_shared':
      return `${userName} shared file`;
    case 'file_downloaded':
      return `${userName} downloaded file`;
      
    // Organization actions
    case 'org_created':
      return `${userName} created organization`;
    case 'org_updated':
      return `${userName} updated organization`;
    case 'org_deleted':
      return `${userName} deleted organization`;
      
    // Message actions
    case 'message_sent':
      return `${userName} sent a message`;
    case 'message_edited':
      return `${userName} edited a message`;
    case 'message_deleted':
      return `${userName} deleted a message`;
      
    // User actions
    case 'user_created':
      return `${userName} created user`;
    case 'user_updated':
      return `${userName} updated user profile`;
    case 'user_role_changed':
      return `${userName} changed user role`;
      
    default:
      return `${userName} performed ${activity.action}`;
  }
}

interface TimelineProps {
  activities: ActivityLog[];
  showUser?: boolean;
  showProject?: boolean;
  compact?: boolean;
}

const actionIcons: Record<string, React.ComponentType<any>> = {
  // Creation
  project_created: IconPlus,
  task_created: IconPlus,
  file_uploaded: IconPlus,
  org_created: IconPlus,
  user_created: IconPlus,
  message_sent: IconMessage,
  
  // Updates
  project_updated: IconEdit,
  task_updated: IconEdit,
  org_updated: IconEdit,
  user_updated: IconEdit,
  message_edited: IconEdit,
  
  // Deletions
  project_deleted: IconTrash,
  task_deleted: IconTrash,
  file_deleted: IconTrash,
  org_deleted: IconTrash,
  message_deleted: IconTrash,
  
  // Status changes
  project_status_changed: IconArrowRight,
  task_status_changed: IconArrowRight,
  task_assigned: IconUser,
  task_unassigned: IconUser,
  
  // File actions
  file_shared: IconShare,
  file_downloaded: IconDownload,
  
  // Default
  default: IconClock,
};

const actionColors: Record<string, string> = {
  // Creation - green
  project_created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  task_created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  file_uploaded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  org_created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  
  // Updates - blue
  project_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  task_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  org_updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  project_status_changed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  task_status_changed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  
  // Deletions - red
  project_deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  task_deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  file_deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  org_deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  
  // Assignments - purple
  task_assigned: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  task_unassigned: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  
  // Messages - gray
  message_sent: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  message_edited: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  message_deleted: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  
  // File actions - amber
  file_shared: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  file_downloaded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  
  // Default
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const entityIcons: Record<string, React.ComponentType<any>> = {
  project: IconClipboardList,
  task: IconClipboardList,
  file: IconFile,
  organization: IconBuilding,
  user: IconUser,
  message: IconMessage,
};

export function Timeline({ 
  activities, 
  showUser = true, 
  showProject = true,
  compact = false 
}: TimelineProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <IconClock className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p>No activity to display</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = actionIcons[activity.action] || actionIcons.default;
        const colorClass = actionColors[activity.action] || actionColors.default;
        const EntityIcon = entityIcons[activity.entityType] || IconClock;
        const message = formatActivityMessage(activity);

        if (compact) {
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-full ${colorClass}`}>
                <Icon className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        }

        return (
          <Card key={activity.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <EntityIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{activity.entityType}</span>
                  {showProject && activity.projectId && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        Project #{activity.projectId.slice(0, 8)}
                      </span>
                    </>
                  )}
                </div>
                
                <p className="text-sm text-foreground">
                  {message}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {showUser && (
                    <div className="flex items-center gap-1">
                      <IconUser className="h-3 w-3" />
                      <span>{activity.userName || 'Unknown'}</span>
                      <span className="text-xs">({activity.userRole})</span>
                    </div>
                  )}
                  <time>
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </time>
                </div>
                
{/* Metadata display removed temporarily for build */}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Compact version for sidebar/widget use
export function TimelineCompact({ activities }: { activities: ActivityLog[] }) {
  return <Timeline activities={activities} compact={true} showUser={false} showProject={false} />;
}

// Full version for dedicated pages
export function TimelineFull({ activities }: { activities: ActivityLog[] }) {
  return <Timeline activities={activities} compact={false} showUser={true} showProject={true} />;
}