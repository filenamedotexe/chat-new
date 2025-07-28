'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@chat/ui';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import type { MessageWithSender } from '../data/messages';
import { getMessagesEdgeFunction, sendMessageEdgeFunction } from '@/lib/api/edge-functions';
import { createClient } from '@/lib/supabase/client';

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const limit = 50;
  const supabase = createClient();

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
        // Set conversation ID for real-time subscriptions
        if (data.messages.length > 0 && data.messages[0].message.conversationId) {
          setConversationId(data.messages[0].message.conversationId);
        }
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

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('🔄 Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('📨 Real-time message received:', payload);
          
          // Add the new message to the state
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
        console.log('📡 Real-time subscription status:', status);
      });

    // Cleanup subscription on unmount or conversation change
    return () => {
      console.log('🧹 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

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