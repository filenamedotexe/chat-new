import { db } from '@chat/database';
import { messages, users, projects } from '@chat/database';
import { eq, and, desc, isNull, or, sql } from 'drizzle-orm';
import type { UserRole } from '@chat/shared-types';

export interface MessageWithSender {
  message: typeof messages.$inferSelect;
  sender: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export interface CreateMessageInput {
  content: string;
  projectId?: string;
  taskId?: string;
  parentMessageId?: string;
  senderId: string;
  recipientId?: string;
  type?: 'text' | 'file' | 'system';
}

/**
 * Creates a new message
 */
export async function createMessage(input: CreateMessageInput): Promise<typeof messages.$inferSelect> {
  // Validate content
  if (!input.content || input.content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  if (input.content.length > 5000) {
    throw new Error('Message content cannot exceed 5000 characters');
  }

  // Create message
  const [message] = await db
    .insert(messages)
    .values({
      content: input.content.trim(),
      projectId: input.projectId,
      taskId: input.taskId,
      parentMessageId: input.parentMessageId,
      senderId: input.senderId,
      recipientId: input.recipientId,
      type: input.type || 'text',
      isEdited: false,
      deletedAt: null,
    })
    .returning();

  return message;
}

/**
 * Gets messages for a project with pagination
 */
export async function getProjectMessages(
  projectId: string,
  userId: string,
  userRole: UserRole,
  options?: {
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }
): Promise<MessageWithSender[]> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  // Build where conditions
  let whereConditions = [eq(messages.projectId, projectId)];
  
  if (!options?.includeDeleted) {
    whereConditions.push(isNull(messages.deletedAt));
  }

  // Get messages with senders
  const results = await db
    .select({
      message: messages,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(and(...whereConditions))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  // Reverse to show oldest first in UI
  return results.reverse().map(result => ({
    message: result.message,
    sender: result.sender,
  }));
}

/**
 * Gets messages for a task
 */
export async function getTaskMessages(
  taskId: string,
  userId: string,
  userRole: UserRole,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<MessageWithSender[]> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const results = await db
    .select({
      message: messages,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(
      and(
        eq(messages.taskId, taskId),
        isNull(messages.deletedAt)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  return results.reverse().map(result => ({
    message: result.message,
    sender: result.sender,
  }));
}

/**
 * Gets direct messages between two users
 */
export async function getDirectMessages(
  userId1: string,
  userId2: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<MessageWithSender[]> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const results = await db
    .select({
      message: messages,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(
      and(
        or(
          and(
            eq(messages.senderId, userId1),
            eq(messages.recipientId, userId2)
          ),
          and(
            eq(messages.senderId, userId2),
            eq(messages.recipientId, userId1)
          )
        ),
        isNull(messages.projectId),
        isNull(messages.taskId),
        isNull(messages.deletedAt)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  return results.reverse().map(result => ({
    message: result.message,
    sender: result.sender,
  }));
}

/**
 * Updates a message (for editing)
 */
export async function updateMessage(
  messageId: string,
  userId: string,
  content: string
): Promise<typeof messages.$inferSelect | null> {
  // Validate content
  if (!content || content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  // Check if user owns the message
  const [existingMessage] = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.senderId, userId),
        isNull(messages.deletedAt)
      )
    )
    .limit(1);

  if (!existingMessage) {
    return null;
  }

  // Update message
  const [updated] = await db
    .update(messages)
    .set({
      content: content.trim(),
      isEdited: true,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId))
    .returning();

  return updated;
}

/**
 * Soft deletes a message
 */
export async function deleteMessage(
  messageId: string,
  userId: string,
  userRole: UserRole
): Promise<boolean> {
  // Check if user can delete (owns message or is admin)
  const [existingMessage] = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.id, messageId),
        isNull(messages.deletedAt)
      )
    )
    .limit(1);

  if (!existingMessage) {
    return false;
  }

  // Only message owner or admin can delete
  if (existingMessage.senderId !== userId && userRole !== 'admin') {
    return false;
  }

  await db
    .update(messages)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId));

  return true;
}

/**
 * Gets unread message count for a user in a project
 */
export async function getUnreadCount(
  userId: string,
  projectId?: string
): Promise<number> {
  // For MVP, we'll return 0 - implement read receipts later
  return 0;
}

/**
 * Marks messages as read
 */
export async function markMessagesAsRead(
  userId: string,
  messageIds: string[]
): Promise<void> {
  // For MVP, this is a no-op - implement read receipts later
  return;
}

/**
 * Search messages
 */
export async function searchMessages(
  userId: string,
  userRole: UserRole,
  query: string,
  options?: {
    projectId?: string;
    taskId?: string;
    limit?: number;
  }
): Promise<MessageWithSender[]> {
  const limit = options?.limit || 20;

  let whereConditions = [
    isNull(messages.deletedAt),
    // Simple text search - could be improved with full-text search
    // Using SQL LIKE operator for pattern matching
    sql`${messages.content} ILIKE ${`%${query}%`}`,
  ];

  if (options?.projectId) {
    whereConditions.push(eq(messages.projectId, options.projectId));
  }

  if (options?.taskId) {
    whereConditions.push(eq(messages.taskId, options.taskId));
  }

  const results = await db
    .select({
      message: messages,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(and(...whereConditions))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return results.map(result => ({
    message: result.message,
    sender: result.sender,
  }));
}