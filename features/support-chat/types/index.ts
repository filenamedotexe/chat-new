// Support Chat Types

export interface Conversation {
  id: string;
  clientId: string;
  status: 'active' | 'resolved';
  assignedTo?: string;
  priority: 'high' | 'normal' | 'low';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithDetails extends Conversation {
  client: {
    id: string;
    name: string | null;
    email: string;
  };
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  };
  unreadCount: number;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: Date;
  };
}

export interface MessageAttachment {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isInternalNote: boolean;
  attachments?: MessageAttachment[];
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportMessageWithSender extends SupportMessage {
  sender: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export interface ChatWidgetState {
  isOpen: boolean;
  conversation: Conversation | null;
  messages: SupportMessageWithSender[];
  unreadCount: number;
  isTyping: boolean;
  isOnline: boolean;
}

export interface BusinessHours {
  isOpen: boolean;
  nextOpenTime?: string;
  message?: string;
}

export type ConversationStatus = 'active' | 'resolved';
export type MessagePriority = 'high' | 'normal' | 'low';