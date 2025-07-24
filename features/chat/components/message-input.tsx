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
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        {/* File attachment button */}
        {onFileAttach && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFileAttach}
            disabled={disabled || sending}
            className="mb-1"
          >
            <IconPaperclip className="h-5 w-5" />
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
            className="min-h-[40px] max-h-32 resize-none"
          />
        </div>

        {/* Emoji button (placeholder for future) */}
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || sending}
          className="mb-1"
          title="Emojis coming soon"
        >
          <IconMoodSmile className="h-5 w-5" />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || sending}
          size="sm"
          className="mb-1"
          aria-label="Send message"
        >
          <IconSend className="h-5 w-5" />
        </Button>
      </div>

      {/* Character count and help */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line • **bold** _italic_ `code`
        </p>
        <p className={`text-xs ${message.length > 4900 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {message.length}/5000
        </p>
      </div>
    </div>
  );
}