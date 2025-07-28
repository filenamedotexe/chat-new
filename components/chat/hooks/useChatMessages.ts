import { useState, useEffect, useCallback } from 'react';
import type { MessageWithSender } from '@/features/chat/data/messages';
import type { ChatType } from '../UniversalChat';
import { getMessagesEdgeFunction, sendMessageEdgeFunction } from '@/lib/api/edge-functions';
import { createClient } from '@/lib/supabase/client';

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const limit = 50;
  const supabase = createClient();


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
          // Set conversation ID for real-time subscriptions (only for regular messages)
          if (data.messages && data.messages.length > 0 && data.messages[0].message.conversationId) {
            setConversationId(data.messages[0].message.conversationId);
          }
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

  // Real-time subscription for regular messages (not AI chat)
  useEffect(() => {
    // Only set up real-time for regular messages, not AI chat
    if (type === 'ai' || !conversationId) return;

    console.log('🔄 [useChatMessages] Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`messages-hook:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('📨 [useChatMessages] Real-time message received:', payload);
          
          const newMessage = payload.new as Record<string, unknown>;
          
          // Create a properly formatted message with sender info
          const messageWithSender: MessageWithSender = {
            message: {
              id: String(newMessage.id),
              content: String(newMessage.content),
              type: String(newMessage.type || 'text'),
              senderId: String(newMessage.sender_id),
              projectId: newMessage.project_id ? String(newMessage.project_id) : null,
              taskId: newMessage.task_id ? String(newMessage.task_id) : null,
              recipientId: newMessage.recipient_id ? String(newMessage.recipient_id) : null,
              parentMessageId: newMessage.parent_message_id ? String(newMessage.parent_message_id) : null,
              isEdited: Boolean(newMessage.is_edited),
              deletedAt: newMessage.deleted_at ? new Date(String(newMessage.deleted_at)) : null,
              createdAt: new Date(String(newMessage.created_at)),
              updatedAt: new Date(String(newMessage.updated_at)),
              conversationId: newMessage.conversation_id ? String(newMessage.conversation_id) : null,
              isInternalNote: Boolean(newMessage.is_internal_note),
              readAt: newMessage.read_at ? new Date(String(newMessage.read_at)) : null,
            },
            sender: {
              id: String(newMessage.sender_id),
              name: 'User', // We'll need to fetch this or include it in the payload
              email: '',
              role: 'team_member',
            },
          };

          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.message.id === newMessage.id);
            if (exists) return prev;
            
            // Add new message at the end (most recent)
            return [...prev, messageWithSender];
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 [useChatMessages] Real-time subscription status:', status);
      });

    // Cleanup subscription on unmount or conversation change
    return () => {
      console.log('🧹 [useChatMessages] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [type, conversationId, supabase]);

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