'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Wifi, WifiOff } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatBubbleProps {
  isOpen?: boolean;
  onClick?: () => void;
  unreadCount?: number;
  isOnline?: boolean;
  className?: string;
}

export function ChatBubble({
  isOpen = false,
  onClick,
  unreadCount = 0,
  isOnline = true,
  className
}: ChatBubbleProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Trigger mount animation after component mounts
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      data-testid="chat-bubble"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isMounted ? 1 : 0, 
        opacity: isMounted ? 1 : 0 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.1
      }}
      className={clsx(
        // Fixed positioning - bottom-right corner
        'fixed z-50',
        // Desktop positioning
        'bottom-6 right-6',
        // Mobile positioning adjustments
        'sm:bottom-8 sm:right-8',
        // Custom className override
        className
      )}
    >
      <motion.button
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={clsx(
          // Base styles
          'relative flex items-center justify-center',
          'w-14 h-14 rounded-full shadow-lg',
          // Mobile touch target size
          'sm:w-16 sm:h-16',
          // Background and colors
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 transition-colors',
          // Focus states for accessibility
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          // Transform origin for animations
          'transform-gpu'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {/* Icon with smooth transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'chat'}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {isOpen ? (
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Online/Offline Status Indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className={clsx(
            'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
            'flex items-center justify-center',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
          title={isOnline ? 'Support team is online' : 'Support team is offline'}
        >
          {isOnline ? (
            <Wifi className="w-2 h-2 text-white" />
          ) : (
            <WifiOff className="w-2 h-2 text-white" />
          )}
        </motion.div>

        {/* Unread Count Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={clsx(
                'absolute -top-2 -left-2 min-w-[20px] h-5 px-1.5',
                'bg-red-500 text-white text-xs font-medium',
                'rounded-full flex items-center justify-center',
                'border-2 border-white shadow-sm'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation for new messages */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.6, 0, 0.6] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={clsx(
                'absolute inset-0 rounded-full',
                'bg-primary border-2 border-primary/50',
                'pointer-events-none'
              )}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip on hover (desktop only) */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'absolute right-full mr-3 top-1/2 -translate-y-1/2',
              'hidden sm:block', // Only show on desktop
              'px-3 py-2 bg-gray-900 text-white text-sm rounded-lg',
              'whitespace-nowrap shadow-lg',
              'before:content-[""] before:absolute before:left-full before:top-1/2',
              'before:-translate-y-1/2 before:border-4 before:border-transparent',
              'before:border-l-gray-900'
            )}
          >
            {isOnline ? 'Chat with support' : 'Leave us a message'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}