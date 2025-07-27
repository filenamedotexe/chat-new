import { db } from '@/packages/database/src/client';
import { conversations, users, messages } from '@/packages/database/src';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import type { 
  Conversation, 
  ConversationWithDetails, 
  SupportMessage, 
  SupportMessageWithSender 
} from '../types';

export async function createConversation(
  clientId: string, 
  assignedTo?: string
): Promise<Conversation> {
  const [conversation] = await db
    .insert(conversations)
    .values({
      clientId,
      assignedTo,
      status: 'active',
      priority: 'normal',
    })
    .returning();

  return {
    id: conversation.id,
    clientId: conversation.clientId,
    status: conversation.status,
    assignedTo: conversation.assignedTo || undefined,
    priority: conversation.priority,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const conversation = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  if (!conversation.length) return null;

  const conv = conversation[0];
  return {
    id: conv.id,
    clientId: conv.clientId,
    status: conv.status,
    assignedTo: conv.assignedTo || undefined,
    priority: conv.priority,
    lastMessageAt: conv.lastMessageAt,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  };
}

export async function updateConversation(
  id: string,
  updates: Partial<Pick<Conversation, 'status' | 'assignedTo' | 'priority'>>
): Promise<Conversation | null> {
  const [updated] = await db
    .update(conversations)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, id))
    .returning();

  if (!updated) return null;

  return {
    id: updated.id,
    clientId: updated.clientId,
    status: updated.status,
    assignedTo: updated.assignedTo || undefined,
    priority: updated.priority,
    lastMessageAt: updated.lastMessageAt,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function getActiveConversations(): Promise<ConversationWithDetails[]> {
  const result = await db
    .select({
      id: conversations.id,
      clientId: conversations.clientId,
      status: conversations.status,
      assignedTo: conversations.assignedTo,
      priority: conversations.priority,
      lastMessageAt: conversations.lastMessageAt,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
      clientName: users.name,
      clientEmail: users.email,
      assigneeName: sql<string | null>`assignee.name`,
      assigneeEmail: sql<string | null>`assignee.email`,
      unreadCount: sql<number>`COALESCE(unread_counts.count, 0)`,
      lastMessageId: sql<string | null>`latest_message.id`,
      lastMessageContent: sql<string | null>`latest_message.content`,
      lastMessageCreatedAt: sql<Date | null>`latest_message.created_at`,
    })
    .from(conversations)
    .leftJoin(users, eq(conversations.clientId, users.id))
    .leftJoin(
      sql`users assignee`,
      sql`conversations.assigned_to = assignee.id`
    )
    .leftJoin(
      sql`(
        SELECT 
          conversation_id, 
          COUNT(*) as count
        FROM messages 
        WHERE conversation_id IS NOT NULL 
          AND read_at IS NULL 
          AND is_internal_note = false
        GROUP BY conversation_id
      ) unread_counts`,
      sql`conversations.id = unread_counts.conversation_id`
    )
    .leftJoin(
      sql`(
        SELECT DISTINCT ON (conversation_id)
          id,
          conversation_id,
          content,
          created_at
        FROM messages
        WHERE conversation_id IS NOT NULL
        ORDER BY conversation_id, created_at DESC
      ) latest_message`,
      sql`conversations.id = latest_message.conversation_id`
    )
    .where(eq(conversations.status, 'active'))
    .orderBy(desc(conversations.lastMessageAt));

  return result.map(row => ({
    id: row.id,
    clientId: row.clientId,
    status: row.status,
    assignedTo: row.assignedTo || undefined,
    priority: row.priority,
    lastMessageAt: row.lastMessageAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    client: {
      id: row.clientId,
      name: row.clientName,
      email: row.clientEmail || '',
    },
    assignee: row.assignedTo ? {
      id: row.assignedTo,
      name: row.assigneeName,
      email: row.assigneeEmail || '',
    } : undefined,
    unreadCount: row.unreadCount,
    lastMessage: row.lastMessageId ? {
      id: row.lastMessageId,
      content: row.lastMessageContent!,
      createdAt: row.lastMessageCreatedAt!,
    } : undefined,
  }));
}

export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<SupportMessageWithSender[]> {
  const result = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      content: messages.content,
      isInternalNote: messages.isInternalNote,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
      updatedAt: messages.updatedAt,
      senderName: users.name,
      senderEmail: users.email,
      senderRole: sql<string>`COALESCE(users.role, 'user')`,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(
      and(
        eq(messages.conversationId, conversationId),
        sql`messages.deleted_at IS NULL`
      )
    )
    .orderBy(asc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  return result.map(row => ({
    id: row.id,
    conversationId: row.conversationId!,
    senderId: row.senderId,
    content: row.content,
    isInternalNote: row.isInternalNote,
    readAt: row.readAt || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    sender: {
      id: row.senderId,
      name: row.senderName,
      email: row.senderEmail || '',
      role: row.senderRole,
    },
  }));
}

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string,
  isInternalNote: boolean = false
): Promise<SupportMessage> {
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId,
      content,
      isInternalNote,
      type: 'text',
    })
    .returning();

  return {
    id: message.id,
    conversationId: message.conversationId!,
    senderId: message.senderId,
    content: message.content,
    isInternalNote: message.isInternalNote,
    readAt: message.readAt || undefined,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(eq(messages.id, messageId));
}

export async function getOrCreateClientConversation(clientId: string): Promise<Conversation> {
  // Try to find existing active conversation
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.clientId, clientId),
        eq(conversations.status, 'active')
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const conv = existing[0];
    return {
      id: conv.id,
      clientId: conv.clientId,
      status: conv.status,
      assignedTo: conv.assignedTo || undefined,
      priority: conv.priority,
      lastMessageAt: conv.lastMessageAt,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  }

  // Create new conversation
  return createConversation(clientId);
}