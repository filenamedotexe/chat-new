import { db } from '@/packages/database/src/client';
import { 
  activityLogs, 
  ActivityLog, 
  NewActivityLog,
  ActivityAction,
  EntityType 
} from '@/packages/database/src/schema/activity';
import { eq, desc, and, or, gte } from 'drizzle-orm';

interface CreateActivityLogParams {
  userId: string;
  userRole: string;
  userName?: string | null;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  projectId?: string;
  taskId?: string;
  organizationId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
}

export async function createActivityLog(params: CreateActivityLogParams): Promise<ActivityLog> {
  try {
    const [log] = await db
      .insert(activityLogs)
      .values({
        userId: params.userId,
        userRole: params.userRole,
        userName: params.userName || undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        projectId: params.projectId,
        taskId: params.taskId,
        organizationId: params.organizationId,
        oldValues: params.oldValues,
        newValues: params.newValues,
        metadata: params.metadata,
      })
      .returning();
    
    return log;
  } catch (error) {
    console.error('Failed to create activity log:', error);
    throw error;
  }
}

interface GetActivityLogsParams {
  userId?: string;
  projectId?: string;
  entityType?: EntityType;
  entityId?: string;
  action?: ActivityAction;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export async function getActivityLogs(params: GetActivityLogsParams = {}): Promise<ActivityLog[]> {
  const { 
    userId, 
    projectId, 
    entityType, 
    entityId, 
    action,
    limit = 50, 
    offset = 0,
    startDate,
    endDate
  } = params;

  const conditions = [];
  
  if (userId) {
    conditions.push(eq(activityLogs.userId, userId));
  }
  
  if (projectId) {
    conditions.push(eq(activityLogs.projectId, projectId));
  }
  
  if (entityType && entityId) {
    conditions.push(
      and(
        eq(activityLogs.entityType, entityType),
        eq(activityLogs.entityId, entityId)
      )
    );
  }
  
  if (action) {
    conditions.push(eq(activityLogs.action, action));
  }
  
  if (startDate) {
    conditions.push(gte(activityLogs.createdAt, startDate));
  }
  
  if (endDate) {
    conditions.push(gte(activityLogs.createdAt, endDate));
  }

  const query = db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
}

// Get activity for a specific entity
export async function getEntityActivity(
  entityType: EntityType, 
  entityId: string
): Promise<ActivityLog[]> {
  return db
    .select()
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.entityType, entityType),
        eq(activityLogs.entityId, entityId)
      )
    )
    .orderBy(desc(activityLogs.createdAt));
}

// Get recent activity for admin dashboard
export async function getRecentActivity(limit = 20): Promise<ActivityLog[]> {
  return db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

// Get activity summary for a project
export async function getProjectActivitySummary(projectId: string) {
  const logs = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.projectId, projectId))
    .orderBy(desc(activityLogs.createdAt));
  
  // Group by action type
  const summary = logs.reduce((acc, log) => {
    if (!acc[log.action]) {
      acc[log.action] = 0;
    }
    acc[log.action]++;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: logs.length,
    byAction: summary,
    recent: logs.slice(0, 10)
  };
}

// Helper to format activity message
export function formatActivityMessage(log: ActivityLog): string {
  const userName = log.userName || 'Unknown user';
  const entityName = log.entityName || `${log.entityType} ${log.entityId}`;
  
  switch (log.action) {
    // Projects
    case 'project_created':
      return `${userName} created project "${entityName}"`;
    case 'project_updated':
      return `${userName} updated project "${entityName}"`;
    case 'project_deleted':
      return `${userName} deleted project "${entityName}"`;
    case 'project_status_changed':
      return `${userName} changed status of project "${entityName}" from ${(log.oldValues as any)?.status} to ${(log.newValues as any)?.status}`;
    
    // Tasks
    case 'task_created':
      return `${userName} created task "${entityName}"`;
    case 'task_updated':
      return `${userName} updated task "${entityName}"`;
    case 'task_deleted':
      return `${userName} deleted task "${entityName}"`;
    case 'task_status_changed':
      return `${userName} moved task "${entityName}" from ${(log.oldValues as any)?.status} to ${(log.newValues as any)?.status}`;
    case 'task_assigned':
      return `${userName} assigned task "${entityName}" to ${(log.newValues as any)?.assigneeName || 'someone'}`;
    case 'task_unassigned':
      return `${userName} unassigned task "${entityName}"`;
    
    // Files
    case 'file_uploaded':
      return `${userName} uploaded file "${entityName}"`;
    case 'file_deleted':
      return `${userName} deleted file "${entityName}"`;
    case 'file_shared':
      return `${userName} shared file "${entityName}"`;
    case 'file_downloaded':
      return `${userName} downloaded file "${entityName}"`;
    
    // Organizations
    case 'org_created':
      return `${userName} created organization "${entityName}"`;
    case 'org_updated':
      return `${userName} updated organization "${entityName}"`;
    case 'org_deleted':
      return `${userName} deleted organization "${entityName}"`;
    
    // Messages
    case 'message_sent':
      return `${userName} sent a message`;
    case 'message_edited':
      return `${userName} edited a message`;
    case 'message_deleted':
      return `${userName} deleted a message`;
    
    default:
      return `${userName} performed ${log.action} on ${entityName}`;
  }
}