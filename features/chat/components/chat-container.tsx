'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@chat/ui';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import type { MessageWithSender } from '../data/messages';
import { getMessagesEdgeFunction, sendMessageEdgeFunction } from '@/lib/api/edge-functions';

interface ChatContainerProps {
  projectId?: string;
  taskId?: string;
  recipientId?: string;
  currentUserId: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ChatContainer({
  projectId,
  taskId,
  recipientId,
  currentUserId,
  title = 'Chat',
  subtitle,
  className = '',
}: ChatContainerProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const limit = 50;

  // Load messages
  const loadMessages = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      // Use Edge Function for messages
      const data = await getMessagesEdgeFunction({
        projectId,
        taskId,
        recipientId,
        limit,
        offset: loadMore ? offset : 0,
      });
      
      if (loadMore) {
        setMessages(prev => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }
      
      setHasMore(data.messages.length === limit);
      setOffset(prev => prev + data.messages.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [projectId, taskId, recipientId, offset, limit]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [projectId, taskId, recipientId]); // Don't include loadMessages to avoid infinite loop

  // Send message
  const handleSendMessage = async (content: string) => {
    try {
      // Use Edge Function for sending messages
      await sendMessageEdgeFunction(content, {
        projectId,
        taskId,
        recipientId,
      });
      
      // Refresh messages to get properly formatted data
      setOffset(0);
      await loadMessages();
    } catch (err) {
      console.error('Send message error:', err);
      throw err;
    }
  };

  // Load more messages
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMessages(true);
    }
  };

  // Refresh messages
  const handleRefresh = () => {
    setOffset(0);
    loadMessages();
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="border-b bg-background/50 backdrop-blur-sm p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        error={error}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />

      {/* Typing Indicator */}
      <TypingIndicator users={typingUsers} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={loading && messages.length === 0}
        placeholder={
          taskId 
            ? 'Add a comment...' 
            : recipientId 
            ? 'Send a direct message...' 
            : 'Send a message...'
        }
      />
    </Card>
  );
}