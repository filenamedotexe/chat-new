'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { ChatBubble } from '@chat/ui';
import { Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { MessageAttachments } from './message-attachments';
import type { SupportMessageWithSender } from '../types';

interface MessageListProps {
  messages: SupportMessageWithSender[];
  currentUserId: string;
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isOnline?: boolean;
  className?: string;
}

export function MessageList({
  messages,
  currentUserId,
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
  isOnline = true,
  className
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Auto-scroll to bottom when new messages arrive (but only if user isn't scrolling)
  useEffect(() => {
    if (autoScroll && !isUserScrolling && bottomRef.current) {
      const scrollBehavior = messages.length > 10 ? 'auto' : 'smooth';
      bottomRef.current.scrollIntoView({ behavior: scrollBehavior });
    }
  }, [messages, autoScroll, isUserScrolling]);

  // Filter out internal notes for non-admin users
  const visibleMessages = messages.filter(msg => {
    // For now, show all messages. Later we'll add role-based filtering
    // TODO: Filter internal notes based on user role
    return !msg.isInternalNote || msg.sender.role === 'admin' || msg.sender.role === 'team';
  });

  // Group messages by date
  const groupedMessages = visibleMessages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt);
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
  }, {} as Record<string, SupportMessageWithSender[]>);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if user is near bottom (within 150px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setAutoScroll(isNearBottom);
    
    // Detect user scrolling
    setIsUserScrolling(true);
    
    // Check if user scrolled to top for loading more
    if (scrollTop === 0 && hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  };

  // Reset user scrolling flag after scroll stops
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const resetScrolling = () => {
      timeoutId = setTimeout(() => {
        setIsUserScrolling(false);
      }, 150);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', resetScrolling);
      return () => {
        container.removeEventListener('scroll', resetScrolling);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  // Error state
  if (error) {
    return (
      <div className={clsx('flex items-center justify-center h-full text-destructive', className)}>
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (visibleMessages.length === 0 && !loading) {
    return (
      <div className={clsx('flex items-center justify-center h-full', className)}>
        <div className="text-center p-6 max-w-sm">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-medium text-sm mb-2">Start the conversation</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isOnline 
              ? "Send us a message and we'll get back to you right away!" 
              : "Send us a message and we'll reply as soon as we're back online."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={clsx('flex-1 overflow-y-auto', className)}
      onScroll={handleScroll}
      data-testid="message-list"
    >
      {/* Load more indicator at top */}
      {loading && visibleMessages.length > 0 && (
        <div className="flex justify-center py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more messages...
          </div>
        </div>
      )}

      {/* Initial loading state */}
      {loading && visibleMessages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading conversation...
          </div>
        </div>
      )}

      {/* Messages grouped by date */}
      <div className="p-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground font-medium px-3 bg-background">
                {date}
              </span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Messages for this date */}
            <div className="space-y-1">
              {dateMessages.map((msg, index) => {
                const isOwnMessage = msg.senderId === currentUserId;
                
                // Check if this message is from the same sender as the previous one
                const prevMsg = index > 0 ? dateMessages[index - 1] : null;
                const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
                
                // Check if messages are close in time (within 5 minutes)
                const isCloseInTime = prevMsg && 
                  (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 5 * 60 * 1000;
                
                const isGrouped = isSameSender && isCloseInTime;
                
                // Determine if timestamp should be shown
                const showTimestamp = !isSameSender || index === dateMessages.length - 1 || 
                  (index < dateMessages.length - 1 && dateMessages[index + 1].senderId !== msg.senderId);

                // Create sender object for ChatBubble
                const sender = {
                  id: msg.sender.id,
                  name: msg.sender.name,
                  email: msg.sender.email,
                };

                return (
                  <div
                    key={msg.id}
                    className={clsx(
                      // Add visual indicator for internal notes
                      msg.isInternalNote && 'opacity-75 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-2 border-l-2 border-yellow-400'
                    )}
                  >
                    <ChatBubble
                      content={msg.content}
                      isOwnMessage={isOwnMessage}
                      sender={sender}
                      timestamp={showTimestamp ? new Date(msg.createdAt) : undefined}
                      isGrouped={isGrouped || false}
                      showAvatar={!isGrouped}
                      showSenderName={!isOwnMessage && !isGrouped}
                    />
                    
                    {/* Message attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={clsx(
                        'mt-2',
                        isOwnMessage ? 'mr-11' : 'ml-11'
                      )}>
                        <MessageAttachments attachments={msg.attachments} />
                      </div>
                    )}
                    
                    {/* Internal note indicator */}
                    {msg.isInternalNote && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium ml-11 -mt-2 mb-2">
                        Internal Note
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll to bottom anchor */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}