'use client';

import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSend, IconLoader2 } from '@tabler/icons-react';
import { ChatBubble, Input, Button } from '@chat/ui';
import { useRef, useEffect } from 'react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ChatBubble
                role={message.role as 'user' | 'assistant'}
                content={message.content}
                isStreaming={isLoading && message === messages[messages.length - 1]}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t p-4 flex gap-2"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="md"
        >
          {isLoading ? (
            <IconLoader2 className="h-5 w-5 animate-spin" />
          ) : (
            <IconSend className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}