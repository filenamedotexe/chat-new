'use client';

import { useState } from 'react';
import { ChatBubble } from '@/features/support-chat';

export default function TestChatBubblePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="p-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat Bubble Component Test</h1>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-primary"
              >
                Toggle Open: {isOpen ? 'Open' : 'Closed'}
              </button>
              
              <button
                onClick={() => setUnreadCount(prev => prev === 0 ? 3 : 0)}
                className="btn btn-secondary"
              >
                Toggle Unread Count: {unreadCount}
              </button>
              
              <button
                onClick={() => setIsOnline(!isOnline)}
                className="btn btn-outline"
              >
                Toggle Online: {isOnline ? 'Online' : 'Offline'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Component Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">✅ Implemented Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Fixed positioning (bottom-right)</li>
                  <li>Smooth scale animation on mount</li>
                  <li>Online/offline status indicator</li>
                  <li>Unread message count badge</li>
                  <li>Mobile positioning adjustments</li>
                  <li>Hover animations and tooltip</li>
                  <li>Icon transition (chat ↔ close)</li>
                  <li>Pulse animation for unread messages</li>
                  <li>Accessibility features (ARIA labels)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">📱 Responsive Design:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Desktop: 64px (w-16 h-16)</li>
                  <li>Mobile: 56px (w-14 h-14)</li>
                  <li>Touch-friendly tap targets</li>
                  <li>Tooltip hidden on mobile</li>
                  <li>Proper spacing adjustments</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Look at the bottom-right corner for the floating chat bubble</li>
              <li>Notice the smooth scale-in animation when the page loads</li>
              <li>Hover over the bubble to see the tooltip (desktop only)</li>
              <li>Click to toggle between chat icon and close icon</li>
              <li>Test the unread count badge and online status indicator</li>
              <li>Try on mobile to verify responsive behavior</li>
            </ol>
          </div>
        </div>
      </div>

      {/* The actual chat bubble component */}
      <ChatBubble
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        unreadCount={unreadCount}
        isOnline={isOnline}
      />
    </div>
  );
}