'use client';

import { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Card, ChatBubble } from '@chat/ui';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import type { MessageWithSender } from '../data/messages';

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId: string;
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.message.createdAt);
    let dateKey: string;
    
    if (isToday(date)) {
      dateKey = 'Today';
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(msg);
    return groups;
  }, {} as Record<string, MessageWithSender[]>);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if user is near bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
    
    // Check if user scrolled to top for loading more
    if (scrollTop === 0 && hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  };

  if (error) {
    return (
      <Card className="flex items-center justify-center h-96 text-destructive">
        <div className="text-center">
          <IconAlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4"
      onScroll={handleScroll}
    >
      {/* Load more indicator */}
      {loading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="mb-6">
          {/* Date separator */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground font-medium px-3">
              {date}
            </span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {dateMessages.map((msg, index) => {
              const isOwnMessage = msg.sender.id === currentUserId;
              
              // Check if this message is from the same sender as the previous one
              const prevMsg = index > 0 ? dateMessages[index - 1] : null;
              const isSameSender = prevMsg && prevMsg.sender.id === msg.sender.id;
              
              // Check if messages are close in time (within 5 minutes)
              const isCloseInTime = prevMsg && 
                (new Date(msg.message.createdAt).getTime() - new Date(prevMsg.message.createdAt).getTime()) < 5 * 60 * 1000;
              
              const isGrouped = isSameSender && isCloseInTime;
              
              // Determine if timestamp should be shown
              const showTimestamp = !isSameSender || index === dateMessages.length - 1 || 
                (index < dateMessages.length - 1 && dateMessages[index + 1].sender.id !== msg.sender.id);

              return (
                <ChatBubble
                  key={msg.message.id}
                  content={msg.message.content}
                  isOwnMessage={isOwnMessage}
                  sender={msg.sender}
                  timestamp={showTimestamp ? new Date(msg.message.createdAt) : undefined}
                  isGrouped={isGrouped || false}
                  showAvatar={true}
                  showSenderName={true}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {loading && messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}