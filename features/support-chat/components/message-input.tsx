'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageInputProps {
  onSendMessage?: (content: string, files?: File[]) => void;
  disabled?: boolean;
  isOffline?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxLength?: number;
  allowFileUpload?: boolean;
  className?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  isOffline = false,
  loading = false,
  placeholder = "Type your message...",
  maxLength = 1000,
  allowFileUpload = true,
  className
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim() && selectedFiles.length === 0) return;
    if (disabled || loading) return;

    onSendMessage?.(message.trim(), selectedFiles.length > 0 ? selectedFiles : undefined);
    setMessage('');
    setSelectedFiles([]);
    setUploadError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !allowFileUpload) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        return;
      }

      // Check file type (basic validation)
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain', 'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    } else {
      setUploadError(null);
    }

    // Limit to 5 files total
    const totalFiles = [...selectedFiles, ...validFiles];
    if (totalFiles.length > 5) {
      setUploadError('Maximum 5 files allowed');
      setSelectedFiles(totalFiles.slice(0, 5));
    } else {
      setSelectedFiles(totalFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadError(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (allowFileUpload && !disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (allowFileUpload && !disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;
  const canSend = (message.trim() || selectedFiles.length > 0) && !disabled && !loading && !isOverLimit;

  return (
    <div className={clsx('border-t border-border bg-background', className)}>
      {/* File Preview Area */}
      {selectedFiles.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted rounded-md px-2 py-1 text-xs"
              >
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-[120px]" title={file.name}>
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div 
        className={clsx(
          'p-4 transition-colors',
          isDragging && 'bg-muted/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          {allowFileUpload && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={disabled}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || loading}
                className={clsx(
                  'p-2 rounded-md transition-colors self-end mb-1',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  disabled || loading
                    ? 'text-muted-foreground cursor-not-allowed'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
                aria-label="Attach file"
                data-testid="attach-file-button"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isOffline ? "You're offline. Messages will be sent when you're back online." : placeholder}
              disabled={disabled || loading}
              className={clsx(
                'w-full resize-none rounded-md border border-input',
                'bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'min-h-[40px] max-h-[120px]',
                disabled && 'cursor-not-allowed opacity-50',
                isOverLimit && 'border-destructive focus:ring-destructive'
              )}
              rows={1}
              data-testid="message-input"
            />
            
            {/* Character Count */}
            {(isNearLimit || isOverLimit) && (
              <div className={clsx(
                'absolute -bottom-5 right-1 text-xs',
                isOverLimit ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {characterCount}/{maxLength}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            className={clsx(
              'p-2 rounded-md transition-colors self-end mb-1',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'min-w-[36px] flex items-center justify-center',
              canSend
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
            aria-label="Send message"
            data-testid="send-button"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Helper Text */}
        {!isOffline && (
          <div className="mt-2 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
            {allowFileUpload && " • Drag and drop files to attach"}
          </div>
        )}
        
        {isOffline && (
          <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
            You're currently offline. Messages will be sent when connection is restored.
          </div>
        )}
      </div>
    </div>
  );
}