'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, X, Paperclip, Send, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { MessageList } from './message-list';
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
  onSendMessage?: (content: string) => void;
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
  const [message, setMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (onSendMessage) {
      onSendMessage(message.trim());
    } else {
      // Default behavior for testing
      console.log('Sending message:', message.trim());
    }
    
    setMessage('');
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

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-2">
              {/* File upload button */}
              <button
                className={clsx(
                  'p-2 rounded-md hover:bg-muted transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'self-end mb-1'
                )}
                aria-label="Attach file"
                data-testid="attach-file-button"
              >
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {/* Message input */}
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className={clsx(
                    'w-full resize-none rounded-md border border-input',
                    'bg-background px-3 py-2 text-sm',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    'min-h-[40px] max-h-[120px]'
                  )}
                  rows={1}
                  data-testid="message-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              
              {/* Send button */}
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={clsx(
                  'p-2 rounded-md transition-colors self-end mb-1',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  message.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                aria-label="Send message"
                data-testid="send-button"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Character count / hints */}
            <div className="mt-2 text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}