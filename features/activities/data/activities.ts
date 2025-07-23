import { db } from '@chat/database';
import { v4 as uuidv4 } from 'uuid';

// Activity types
export type ActivityType = 
  | 'task_created'
  | 'task_updated'
  | 'task_status_changed'
  | 'task_assigned'
  | 'task_completed'
  | 'project_created'
  | 'project_updated'
  | 'file_uploaded'
  | 'comment_added';

interface CreateActivityInput {
  type: ActivityType;
  userId: string;
  entityType: 'task' | 'project' | 'file' | 'comment';
  entityId: string;
  projectId?: string;
  description: string;
  metadata?: Record<string, any>;
}

// For now, we'll just log to console
// In a real app, this would save to an activities table
export async function createActivity(input: CreateActivityInput) {
  const activity = {
    id: uuidv4(),
    ...input,
    createdAt: new Date(),
  };

  // Log the activity
  console.log('[ACTIVITY]', {
    timestamp: activity.createdAt.toISOString(),
    type: activity.type,
    user: activity.userId,
    entity: `${activity.entityType}:${activity.entityId}`,
    description: activity.description,
    metadata: activity.metadata,
  });

  // In production, save to database:
  // await db.insert(activities).values(activity);

  return activity;
}

// Helper functions for common activities
export async function logTaskStatusChange(
  userId: string,
  taskId: string,
  projectId: string,
  fromStatus: string,
  toStatus: string
) {
  return createActivity({
    type: 'task_status_changed',
    userId,
    entityType: 'task',
    entityId: taskId,
    projectId,
    description: `Task status changed from ${fromStatus} to ${toStatus}`,
    metadata: {
      fromStatus,
      toStatus,
    },
  });
}