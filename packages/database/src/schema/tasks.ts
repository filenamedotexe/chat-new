import { pgTable, text, timestamp, uuid, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { projects } from './organizations';
import { users } from './auth';

export const taskStatus = pgEnum('task_status', [
  'not_started',
  'in_progress',
  'needs_review',
  'done'
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatus('status').notNull().default('not_started'),
  assignedToId: uuid('assigned_to_id')
    .references(() => users.id, { onDelete: 'set null' }),
  createdById: uuid('created_by_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});