import { pgTable, uuid, varchar, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

// Enums
export const conversationStatusEnum = pgEnum('conversation_status', ['active', 'resolved']);
export const conversationPriorityEnum = pgEnum('conversation_priority', ['high', 'normal', 'low']);

// Conversations table for support chat
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: conversationStatusEnum('status').default('active').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  priority: conversationPriorityEnum('priority').default('normal').notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    clientIdIdx: index('idx_conversations_client_id').on(table.clientId),
    assignedToIdx: index('idx_conversations_assigned_to').on(table.assignedTo),
    statusIdx: index('idx_conversations_status').on(table.status),
  };
});

// Export types
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;