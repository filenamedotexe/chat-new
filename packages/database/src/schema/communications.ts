import { pgTable, text, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';
import { projects } from './organizations';
import { users } from './auth';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  content: text('content').notNull(),
  isEdited: boolean('is_edited').default(false).notNull(),
  editedAt: timestamp('edited_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    projectIdIdx: index('messages_project_id_idx').on(table.projectId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  };
});

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    projectIdIdx: index('notes_project_id_idx').on(table.projectId),
    isInternalIdx: index('notes_is_internal_idx').on(table.isInternal),
  };
});