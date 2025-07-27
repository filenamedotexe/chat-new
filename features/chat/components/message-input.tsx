'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button, Textarea } from '@chat/ui';
import { IconSend, IconPaperclip, IconMoodSmile } from '@tabler/icons-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onFileAttach?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  onFileAttach,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const content = message.trim();
    if (!content || sending || disabled) return;

    setSending(true);
    try {
      await onSendMessage(content);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t bg-background/50 backdrop-blur-sm p-4">
      <div className="flex items-end gap-2">
        {/* File attachment button */}
        {onFileAttach && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFileAttach}
            disabled={disabled || sending}
            className="mb-1 h-10 w-10 lg:h-11 lg:w-11 rounded-xl hover:bg-muted transition-colors"
          >
            <IconPaperclip className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>
        )}

        {/* Message input */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className="min-h-[48px] lg:min-h-[56px] max-h-32 lg:max-h-40 resize-none text-base lg:text-lg px-4 py-3 rounded-xl border-muted-foreground/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Emoji button (placeholder for future) */}
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || sending}
          className="mb-1 h-10 w-10 lg:h-11 lg:w-11 rounded-xl hover:bg-muted transition-colors"
          title="Emojis coming soon"
        >
          <IconMoodSmile className="h-5 w-5 lg:h-6 lg:w-6" />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || sending}
          size="sm"
          className="mb-1 h-10 w-10 lg:h-11 lg:w-11 rounded-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 disabled:hover:scale-100"
          aria-label="Send message"
        >
          <IconSend className={`h-5 w-5 lg:h-6 lg:w-6 transition-transform ${sending ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Character count and help */}
      <div className="flex justify-between items-center mt-3 px-1">
        <p className="text-xs lg:text-sm text-muted-foreground">
          <span className="hidden sm:inline">Press </span><kbd className="px-1.5 py-0.5 text-xs rounded bg-muted">Enter</kbd> to send<span className="hidden sm:inline">, <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted">Shift+Enter</kbd> for new line</span>
        </p>
        <div className="flex items-center gap-2">
          {message.length > 4500 && (
            <div className="text-xs lg:text-sm">
              <span className={message.length > 4900 ? 'text-destructive font-medium' : 'text-warning'}>
                {5000 - message.length} characters left
              </span>
            </div>
          )}
          <p className={`text-xs lg:text-sm transition-colors ${
            message.length > 4900 ? 'text-destructive font-medium' : 
            message.length > 4500 ? 'text-warning' : 
            'text-muted-foreground'
          }`}>
            {message.length}/5000
          </p>
        </div>
      </div>
    </div>
  );
}