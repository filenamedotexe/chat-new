import { pgTable, text, timestamp, uuid, boolean, index, varchar } from 'drizzle-orm/pg-core';
import { projects } from './organizations';
import { users } from './auth';
import { tasks } from './tasks';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).default('text'),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id')
    .references(() => tasks.id, { onDelete: 'cascade' }),
  recipientId: uuid('recipient_id')
    .references(() => users.id, { onDelete: 'restrict' }),
  parentMessageId: uuid('parent_message_id'),
  isEdited: boolean('is_edited').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // Support chat columns
  conversationId: uuid('conversation_id'),
  isInternalNote: boolean('is_internal_note').default(false).notNull(),
  readAt: timestamp('read_at'),
}, (table) => {
  return {
    projectIdIdx: index('messages_project_id_idx').on(table.projectId),
    taskIdIdx: index('messages_task_id_idx').on(table.taskId),
    senderIdIdx: index('messages_sender_id_idx').on(table.senderId),
    recipientIdIdx: index('messages_recipient_id_idx').on(table.recipientId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
    deletedAtIdx: index('messages_deleted_at_idx').on(table.deletedAt),
    conversationIdIdx: index('messages_conversation_id_idx').on(table.conversationId),
    readAtIdx: index('messages_read_at_idx').on(table.readAt),
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