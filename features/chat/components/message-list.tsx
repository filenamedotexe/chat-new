'use client';

import { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Card } from '@chat/ui';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'h:mm a');
  };

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
      className="flex-1 overflow-y-auto p-4 space-y-4"
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
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground font-medium">
              {date}
            </span>
            <div className="flex-1 border-t" />
          </div>

          {/* Messages for this date */}
          <div className="space-y-3">
            {dateMessages.map((msg) => {
              const isOwnMessage = msg.sender.id === currentUserId;
              const time = formatTime(msg.message.createdAt);

              return (
                <div
                  key={msg.message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar placeholder - could add real avatars later */}
                  {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {msg.sender.name?.[0]?.toUpperCase() || msg.sender.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {!isOwnMessage && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {msg.sender.name || msg.sender.email}
                      </p>
                    )}
                    
                    <div
                      className={`rounded-lg px-4 py-2 overflow-hidden ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className={`text-sm prose prose-sm max-w-none break-words overflow-wrap-anywhere ${
                        isOwnMessage 
                          ? 'prose-invert' 
                          : 'dark:prose-invert'
                      }`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Style links to be visible in messages
                            a: ({ children, ...props }) => (
                              <a {...props} className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                            // Ensure code blocks are styled properly
                            code: ({ children, className, ...props }) => {
                              const isInline = !className;
                              return isInline 
                                ? <code className={`px-1 py-0.5 rounded ${isOwnMessage ? 'bg-primary-foreground/20' : 'bg-muted'}`} {...props}>{children}</code>
                                : <code className={`block p-2 rounded overflow-x-auto whitespace-pre ${isOwnMessage ? 'bg-primary-foreground/20' : 'bg-muted'}`} {...props}>{children}</code>
                            },
                            // Keep paragraphs compact
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            // Style lists
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          }}
                        >
                          {msg.message.content}
                        </ReactMarkdown>
                      </div>
                      {msg.message.isEdited && (
                        <p className="text-xs opacity-70 mt-1">(edited)</p>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {time}
                    </p>
                  </div>

                  {/* Avatar placeholder for own messages */}
                  {isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary-foreground">
                        {msg.sender.name?.[0]?.toUpperCase() || msg.sender.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
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