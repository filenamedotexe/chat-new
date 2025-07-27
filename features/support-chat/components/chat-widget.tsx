'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, X, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import type { SupportMessageWithSender } from '../types';

interface ChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  isOnline?: boolean;
  messages?: SupportMessageWithSender[];
  currentUserId?: string;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onSendMessage?: (content: string, files?: File[]) => void;
}

export function ChatWidget({
  isOpen = false,
  onClose,
  onMinimize,
  className,
  isOnline = true,
  messages = [],
  currentUserId = 'current-user', // Default for testing
  loading = false,
  onLoadMore,
  hasMore = false,
  onSendMessage
}: ChatWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendMessage = (content: string, files?: File[]) => {
    if (!content.trim() && !files?.length) return;
    
    if (onSendMessage) {
      onSendMessage(content, files);
    } else {
      // Default behavior for testing
      console.log('Sending message:', content, files ? `with ${files.length} files` : '');
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.8, 
            y: 20,
            transformOrigin: 'bottom right'
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8, 
            y: 20 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.3
          }}
          className={clsx(
            // Fixed positioning - bottom-right, above chat bubble
            'fixed z-40',
            // Desktop positioning
            'bottom-24 right-6',
            // Mobile positioning - full screen on mobile
            'sm:bottom-28 sm:right-8',
            // Widget size
            'w-80 sm:w-96',
            // Mobile full screen
            'h-[calc(100vh-2rem)] sm:h-[600px]',
            // Styling
            'bg-background border border-border rounded-lg shadow-2xl',
            'flex flex-col overflow-hidden',
            // Custom className
            className
          )}
          data-testid="chat-widget"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div className={clsx(
                  'absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white',
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support Chat</h3>
                <p className="text-xs text-muted-foreground">
                  {isOnline ? 'We\'re online' : 'We\'ll reply soon'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onMinimize && (
                <button
                  onClick={onMinimize}
                  className={clsx(
                    'p-1.5 rounded-md hover:bg-muted transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  )}
                  aria-label="Minimize chat"
                  data-testid="minimize-button"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              
              {onClose && (
                <button
                  onClick={onClose}
                  className={clsx(
                    'p-1.5 rounded-md hover:bg-muted transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  )}
                  aria-label="Close chat"
                  data-testid="close-button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Message List Area */}
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            loading={loading}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            isOnline={isOnline}
            className="flex-1"
          />

          {/* Message Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={loading}
            isOffline={!isOnline}
            loading={loading}
            placeholder="Type your message..."
            maxLength={1000}
            allowFileUpload={true}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}