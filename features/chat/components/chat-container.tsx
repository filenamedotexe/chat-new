'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@chat/ui';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import type { MessageWithSender } from '../data/messages';

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
  const limit = 50;

  // Load messages
  const loadMessages = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (loadMore ? offset : 0).toString(),
      });

      if (projectId) params.append('projectId', projectId);
      if (taskId) params.append('taskId', taskId);
      if (recipientId) params.append('recipientId', recipientId);

      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      
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
      const body: any = { content };
      if (projectId) body.projectId = projectId;
      if (taskId) body.taskId = taskId;
      if (recipientId) body.recipientId = recipientId;

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      
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
      <div className="border-b p-4">
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