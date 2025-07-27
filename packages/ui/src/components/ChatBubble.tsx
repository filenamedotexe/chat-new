'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar } from './Avatar';

interface ChatBubbleProps {
  content: string;
  isOwnMessage: boolean;
  sender?: {
    id?: string;
    name?: string | null;
    email?: string;
  };
  timestamp?: Date;
  isGrouped?: boolean;
  isStreaming?: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
}

export function ChatBubble({
  content,
  isOwnMessage,
  sender,
  timestamp,
  isGrouped = false,
  isStreaming = false,
  showAvatar = true,
  showSenderName = true,
}: ChatBubbleProps) {
  const senderName = sender?.name || sender?.email || 'Unknown';
  const avatarFallback = senderName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex gap-3 mb-4',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row',
        isGrouped && '-mt-2'
      )}
    >
      {/* Avatar */}
      <div className="w-8 flex-shrink-0">
        {showAvatar && !isGrouped && (
          <Avatar
            fallback={avatarFallback}
            size="sm"
            className="mt-1"
          />
        )}
      </div>

      {/* Message Content */}
      <div className={clsx('flex-1 max-w-[70%]', isOwnMessage && 'flex justify-end')}>
        {/* Sender Name */}
        {!isOwnMessage && showSenderName && !isGrouped && (
          <p className="text-xs text-muted-foreground mb-1 ml-1">
            {senderName}
          </p>
        )}

        {/* Message Bubble */}
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md',
            // Corner rounding for grouping
            isOwnMessage
              ? isGrouped
                ? 'rounded-br-md'
                : 'rounded-br-md'
              : isGrouped
              ? 'rounded-bl-md'
              : 'rounded-bl-md',
            // Colors - using global utilities
            isOwnMessage
              ? 'chat-bubble-sent'
              : 'chat-bubble-received'
          )}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                a: ({ children, ...props }) => (
                  <a {...props} className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className={clsx(
                      'px-1 py-0.5 rounded text-sm',
                      isOwnMessage
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    )}>
                      {children}
                    </code>
                  ) : (
                    <code className={clsx(
                      'block p-2 rounded overflow-x-auto whitespace-pre text-sm',
                      isOwnMessage
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    )}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block w-1 h-4 ml-1 bg-current"
              />
            )}
          </div>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className={clsx(
            'flex items-center gap-2 mt-1 text-xs text-muted-foreground',
            isOwnMessage ? 'justify-end' : 'justify-start'
          )}>
            <span>{timestamp.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}