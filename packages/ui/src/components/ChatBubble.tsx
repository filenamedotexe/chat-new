'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar } from './Avatar';

interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  avatar?: {
    src?: string;
    fallback?: string;
  };
  isStreaming?: boolean;
}

export function ChatBubble({ 
  role, 
  content, 
  timestamp, 
  avatar,
  isStreaming = false 
}: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar
        src={avatar?.src}
        fallback={avatar?.fallback || (isUser ? 'U' : 'AI')}
        size="sm"
        className="mt-1"
      />
      
      <div className={clsx('flex-1', isUser && 'flex justify-end')}>
        <div
          className={clsx(
            'rounded-lg px-4 py-2 max-w-[80%]',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm dark:prose-invert max-w-none"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              code: ({ children, ...props }) => {
                const isInline = !props.className;
                return isInline ? (
                  <code className="px-1 py-0.5 rounded bg-muted text-sm">{children}</code>
                ) : (
                  <code className="block p-3 rounded bg-muted text-sm overflow-x-auto">
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
        {timestamp && (
          <div className="mt-1 text-xs text-muted-foreground px-4">
            {timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}