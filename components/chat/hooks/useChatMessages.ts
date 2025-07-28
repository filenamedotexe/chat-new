import { useState, useEffect, useCallback } from 'react';
import type { MessageWithSender } from '@/features/chat/data/messages';
import type { ChatType } from '../UniversalChat';
import { getMessagesEdgeFunction, sendMessageEdgeFunction } from '@/lib/api/edge-functions';

interface UseChatMessagesProps {
  type: ChatType;
  projectId?: string;
  taskId?: string;
  recipientId?: string;
  currentUserId: string;
}

export function useChatMessages({
  type,
  projectId,
  taskId,
  recipientId,
}: UseChatMessagesProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [typingUsers] = useState<string[]>([]);
  const limit = 50;


  // Load messages
  const loadMessages = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      // For AI chat, use the old API endpoint; for regular messages, use Edge Function
      if (type === 'ai') {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: (loadMore ? offset : 0).toString(),
        });

        if (projectId) params.append('projectId', projectId);
        if (taskId) params.append('taskId', taskId);
        if (recipientId) params.append('recipientId', recipientId);

        const response = await fetch(`/api/chat?${params}`);
        if (!response.ok) {
          throw new Error('Failed to load messages');
        }

        const data = await response.json();
        
        if (loadMore) {
          setMessages(prev => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages || []);
        }
        
        setHasMore(data.messages?.length === limit || false);
        setOffset(prev => prev + (data.messages?.length || 0));
      } else {
        // Use Edge Function for regular messages
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
          setMessages(data.messages || []);
        }
        
        setHasMore(data.messages?.length === limit || false);
        setOffset(prev => prev + (data.messages?.length || 0));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [type, projectId, taskId, recipientId, offset, limit]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Send message
  const sendMessage = async (content: string) => {
    try {
      // For AI chat, use the old API endpoint; for regular messages, use Edge Function
      if (type === 'ai') {
        const body: Record<string, unknown> = { content };
        if (projectId) body.projectId = projectId;
        if (taskId) body.taskId = taskId;
        if (recipientId) body.recipientId = recipientId;

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
        }

        const data = await response.json();
        setMessages(prev => [...prev, data]);
      } else {
        // Use Edge Function for regular messages
        await sendMessageEdgeFunction(content, {
          projectId,
          taskId,
          recipientId,
        });

        // Refresh messages for regular chat
        setOffset(0);
        await loadMessages();
      }
    } catch (err) {
      console.error('Send message error:', err);
      throw err;
    }
  };

  // Load more messages
  const loadMore = () => {
    if (!loading && hasMore) {
      loadMessages(true);
    }
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    typingUsers,
    sendMessage,
    loadMore,
  };
}