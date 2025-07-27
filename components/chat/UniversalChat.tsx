'use client';

import { Card } from '@chat/ui';
import { MessageList } from '@/features/chat/components/message-list';
import { MessageInput } from '@/features/chat/components/message-input';
import { TypingIndicator } from '@/features/chat/components/typing-indicator';
import { useChatMessages } from './hooks/useChatMessages';
import { clsx } from 'clsx';

export type ChatType = 'project' | 'task' | 'direct' | 'ai';

export interface UniversalChatProps {
  type: ChatType;
  // IDs for different chat contexts
  projectId?: string;
  taskId?: string;
  recipientId?: string;
  currentUserId: string;
  // UI customization
  title?: string;
  subtitle?: string;
  className?: string;
  height?: string;
  // Feature flags
  showHeader?: boolean;
  showTypingIndicator?: boolean;
  compact?: boolean;
}

export function UniversalChat({
  type,
  projectId,
  taskId,
  recipientId,
  currentUserId,
  title = 'Chat',
  subtitle,
  className = '',
  height = 'h-full',
  showHeader = true,
  showTypingIndicator = true,
  compact = false,
}: UniversalChatProps) {
  const {
    messages,
    loading,
    error,
    hasMore,
    typingUsers,
    sendMessage,
    loadMore,
  } = useChatMessages({
    type,
    projectId,
    taskId,
    recipientId,
    currentUserId,
  });

  const getPlaceholder = () => {
    switch (type) {
      case 'task':
        return 'Add a comment...';
      case 'direct':
        return 'Send a direct message...';
      case 'ai':
        return 'Ask a question...';
      default:
        return 'Send a message...';
    }
  };

  return (
    <Card className={clsx(
      'flex flex-col',
      height,
      compact ? 'p-0' : '',
      className
    )}>
      {/* Header */}
      {showHeader && (
        <div className={clsx(
          'border-b bg-card/50 backdrop-blur-sm',
          compact ? 'px-3 py-2' : 'p-4'
        )}>
          <h2 className={clsx(
            'font-semibold',
            compact ? 'text-base' : 'text-lg'
          )}>{title}</h2>
          {subtitle && (
            <p className={clsx(
              'text-muted-foreground',
              compact ? 'text-xs' : 'text-sm'
            )}>{subtitle}</p>
          )}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        error={error}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />

      {/* Typing Indicator */}
      {showTypingIndicator && typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}

      {/* Input */}
      <MessageInput
        onSendMessage={sendMessage}
        disabled={loading && messages.length === 0}
        placeholder={getPlaceholder()}
      />
    </Card>
  );
}