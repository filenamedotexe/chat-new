'use client';

import { useChat } from 'ai/react';
import { ChatBubble } from '@chat/ui';
import { MessageInput } from '@/features/chat/components/message-input';
import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface AIChatProps {
  className?: string;
  height?: string;
  apiEndpoint?: string;
}

export function AIChat({ 
  className = '',
  height = 'h-[600px]',
  apiEndpoint = '/api/chat',
}: AIChatProps) {
  const { messages, handleInputChange, handleSubmit, isLoading } = useChat({
    api: apiEndpoint,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    // Create a synthetic event for the useChat hook
    const syntheticEvent = {
      preventDefault: () => {},
      currentTarget: {
        elements: {
          prompt: { value: content }
        }
      }
    } as unknown as React.FormEvent<HTMLFormElement>;
    
    handleInputChange({ target: { value: content } } as React.ChangeEvent<HTMLInputElement>);
    await handleSubmit(syntheticEvent);
  };

  return (
    <div className={clsx(
      'flex flex-col rounded-lg border bg-card',
      height,
      className
    )}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Ask me anything! I&apos;m here to help.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            content={message.content}
            isOwnMessage={message.role === 'user'}
            sender={{
              name: message.role === 'user' ? 'You' : 'AI Assistant'
            }}
            timestamp={message.createdAt ? new Date(message.createdAt) : undefined}
            isStreaming={isLoading && index === messages.length - 1}
            showAvatar={true}
            showSenderName={false}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSend}
        disabled={isLoading}
        placeholder="Ask me anything..."
      />
    </div>
  );
}