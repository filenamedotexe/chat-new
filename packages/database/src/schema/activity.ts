import { pgTable, uuid, timestamp, text, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { projects } from './organizations';
import { tasks } from './tasks';

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Actor
  userId: uuid('user_id').references(() => users.id).notNull(),
  userRole: text('user_role').notNull(), // Store role at time of action
  userName: text('user_name'), // Store name at time of action for display
  
  // Action details
  action: text('action').notNull(), // create, update, delete, status_change, assign, upload, etc.
  entityType: text('entity_type').notNull(), // project, task, file, organization, user, etc.
  entityId: uuid('entity_id').notNull(),
  entityName: text('entity_name'), // Store name for display even if entity is deleted
  
  // Optional relations for context
  projectId: uuid('project_id').references(() => projects.id),
  taskId: uuid('task_id').references(() => tasks.id),
  organizationId: uuid('organization_id'),
  
  // Change details
  oldValues: jsonb('old_values'), // Previous state for updates
  newValues: jsonb('new_values'), // New state for updates/creates
  metadata: jsonb('metadata'), // Additional context (e.g., file size, status transition)
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Indexes for efficient querying
  userIdIdx: index('activity_logs_user_id_idx').on(table.userId),
  entityIdx: index('activity_logs_entity_idx').on(table.entityType, table.entityId),
  projectIdIdx: index('activity_logs_project_id_idx').on(table.projectId),
  createdAtIdx: index('activity_logs_created_at_idx').on(table.createdAt),
  actionIdx: index('activity_logs_action_idx').on(table.action),
}));

// Type exports
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// Action type constants
export const ActivityActions = {
  // Projects
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_STATUS_CHANGED: 'project_status_changed',
  
  // Tasks
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_ASSIGNED: 'task_assigned',
  TASK_UNASSIGNED: 'task_unassigned',
  
  // Files
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',
  FILE_SHARED: 'file_shared',
  FILE_DOWNLOADED: 'file_downloaded',
  
  // Organizations
  ORG_CREATED: 'org_created',
  ORG_UPDATED: 'org_updated',
  ORG_DELETED: 'org_deleted',
  
  // Auth
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  
  // Messages
  MESSAGE_SENT: 'message_sent',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
} as const;

export type ActivityAction = typeof ActivityActions[keyof typeof ActivityActions];

// Entity type constants
export const EntityTypes = {
  PROJECT: 'project',
  TASK: 'task',
  FILE: 'file',
  ORGANIZATION: 'organization',
  USER: 'user',
  MESSAGE: 'message',
} as const;

export type EntityType = typeof EntityTypes[keyof typeof EntityTypes];