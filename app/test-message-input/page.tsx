'use client';

import { useState } from 'react';
import { MessageInput } from '@/features/support-chat';

export default function TestMessageInputPage() {
  const [lastMessage, setLastMessage] = useState<{content: string, files?: File[]}>({content: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [allowFileUpload, setAllowFileUpload] = useState(true);
  const [messageHistory, setMessageHistory] = useState<Array<{content: string, files?: File[], timestamp: Date}>>([]);

  const handleSendMessage = (content: string, files?: File[]) => {
    console.log('Message sent:', content, files);
    setLastMessage({ content, files });
    setMessageHistory(prev => [...prev, { content, files, timestamp: new Date() }]);

    // Simulate loading state
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Message Input Component Test</h1>
        
        {/* Controls */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsLoading(!isLoading)}
                className="btn btn-primary"
                data-testid="toggle-loading"
              >
                Loading: {isLoading ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={() => setIsOffline(!isOffline)}
                className="btn btn-secondary"
                data-testid="toggle-offline"
              >
                Offline: {isOffline ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={() => setIsDisabled(!isDisabled)}
                className="btn btn-outline"
                data-testid="toggle-disabled"
              >
                Disabled: {isDisabled ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setAllowFileUpload(!allowFileUpload)}
                className="btn btn-ghost"
                data-testid="toggle-file-upload"
              >
                File Upload: {allowFileUpload ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => {
                  setMessageHistory([]);
                  setLastMessage({content: ''});
                }}
                className="btn btn-destructive"
                data-testid="clear-history"
              >
                Clear History
              </button>
            </div>
          </div>

          {/* Feature Testing */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">✅ Implemented Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">✅ Core Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Auto-resizing textarea (40px to 120px max height)</li>
                  <li>Character limit validation (1000 chars with visual indicator)</li>
                  <li>Send button with loading state and disabled logic</li>
                  <li>Keyboard shortcuts (Enter to send, Shift+Enter for new line)</li>
                  <li>Offline state handling with different placeholder text</li>
                  <li>Disabled state support</li>
                  <li>File upload with drag-and-drop support</li>
                  <li>File type validation (images, PDFs, docs, spreadsheets)</li>
                  <li>File size validation (max 10MB per file)</li>
                  <li>Multiple file support (max 5 files)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">✅ File Upload Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Click to select files or drag and drop</li>
                  <li>File preview with remove buttons</li>
                  <li>File type filtering and validation</li>
                  <li>Error handling for invalid files</li>
                  <li>Visual feedback during drag operations</li>
                  <li>Support for: JPG, PNG, GIF, WebP, PDF, TXT, CSV, DOC, DOCX, XLS, XLSX</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Last Message Display */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Last Message Sent</h2>
            <div className="bg-muted/50 rounded-lg p-4">
              {lastMessage.content ? (
                <div>
                  <p className="text-sm font-medium mb-2">Content:</p>
                  <p className="text-sm bg-background rounded p-2 mb-3">&quot;{lastMessage.content}&quot;</p>
                  {lastMessage.files && lastMessage.files.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Files ({lastMessage.files.length}):</p>
                      <ul className="text-sm text-muted-foreground">
                        {lastMessage.files.map((file, index) => (
                          <li key={index} className="flex items-center gap-2">
                            📎 {file.name} ({Math.round(file.size / 1024)}KB, {file.type})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No messages sent yet</p>
              )}
            </div>
          </div>

          {/* Message History */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Message History ({messageHistory.length})</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {messageHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No messages yet</p>
              ) : (
                messageHistory.slice().reverse().map((msg, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                      {msg.files && msg.files.length > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {msg.files.length} file(s)
                        </span>
                      )}
                    </div>
                    <p className="text-sm">&quot;{msg.content}&quot;</p>
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Files: {msg.files.map(f => f.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Test Instructions */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Type a message and press Enter to send (should auto-resize)</li>
              <li>Try Shift+Enter to create new lines without sending</li>
              <li>Type more than 800 characters to see character count warning</li>
              <li>Type more than 1000 characters to see validation error</li>
              <li>Click the paperclip icon to select files</li>
              <li>Drag and drop files onto the input area</li>
              <li>Try uploading invalid file types (should show error)</li>
              <li>Try uploading large files (&gt;10MB, should show error)</li>
              <li>Upload multiple files and remove some using X button</li>
              <li>Test loading state (send button should show spinner)</li>
              <li>Test offline state (should show offline message)</li>
              <li>Test disabled state (should disable all interactions)</li>
              <li>Toggle file upload off (paperclip should disappear)</li>
            </ol>
          </div>
        </div>

        {/* Message Input Component */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto">
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isDisabled}
              isOffline={isOffline}
              loading={isLoading}
              placeholder={isOffline ? "You're offline. Messages will be sent when you're back online." : "Type your test message here..."}
              maxLength={1000}
              allowFileUpload={allowFileUpload}
            />
          </div>
        </div>

        {/* Bottom spacer to account for fixed input */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}