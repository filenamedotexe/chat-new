'use client';

import { useState } from 'react';
import { ChatBubble, ChatWidget } from '@/features/support-chat';
import type { SupportMessageWithSender } from '@/features/support-chat/types';

// Mock data for testing
const mockMessages: SupportMessageWithSender[] = [
  {
    id: '1',
    conversationId: 'conv-1',
    senderId: 'support-1',
    content: 'Hello! Welcome to our support chat. How can I help you today?',
    isInternalNote: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    sender: {
      id: 'support-1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'admin'
    }
  },
  {
    id: '2',
    conversationId: 'conv-1',
    senderId: 'current-user',
    content: 'Hi! I\'m having trouble with my account settings. When I try to update my profile, it says "Invalid data" but I\'m not sure what\'s wrong.',
    isInternalNote: false,
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    sender: {
      id: 'current-user',
      name: 'Test User',
      email: 'user@test.com',
      role: 'client'
    }
  },
  {
    id: '3',
    conversationId: 'conv-1',
    senderId: 'support-1',
    content: 'I\'d be happy to help you with that! Can you tell me which specific field is showing the error? Also, are you seeing any specific error messages in red text?',
    isInternalNote: false,
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000 + 5 * 60 * 1000),
    updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000 + 5 * 60 * 1000),
    sender: {
      id: 'support-1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'admin'
    }
  },
  {
    id: '4',
    conversationId: 'conv-1',
    senderId: 'support-2',
    content: 'User is reporting profile update issues. This might be related to the validation bug we fixed last week. Need to check if they\'re on the latest version.',
    isInternalNote: true,
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
    sender: {
      id: 'support-2',
      name: 'Mike Johnson',
      email: 'mike@company.com',
      role: 'team'
    }
  },
  {
    id: '5',
    conversationId: 'conv-1',
    senderId: 'current-user',
    content: 'It\'s the "Phone Number" field. When I try to enter my number in the format +1-555-123-4567, it shows "Invalid phone number format".',
    isInternalNote: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    sender: {
      id: 'current-user',
      name: 'Test User',
      email: 'user@test.com',
      role: 'client'
    }
  },
  {
    id: '6',
    conversationId: 'conv-1',
    senderId: 'support-1',
    content: 'Thank you for that detail! I can see the issue now. Our system expects phone numbers without dashes. Can you try entering it as `+15551234567` instead?',
    isInternalNote: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000),
    sender: {
      id: 'support-1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'admin'
    }
  },
  {
    id: '7',
    conversationId: 'conv-1',
    senderId: 'current-user',
    content: 'Perfect! That worked. Thank you so much for your help! 🎉',
    isInternalNote: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    sender: {
      id: 'current-user',
      name: 'Test User',
      email: 'user@test.com',
      role: 'client'
    }
  },
  {
    id: '8',
    conversationId: 'conv-1',
    senderId: 'support-1',
    content: 'You\'re very welcome! I\'m glad we could get that sorted out for you. Is there anything else I can help you with today?',
    isInternalNote: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    updatedAt: new Date(Date.now() - 25 * 60 * 1000),
    sender: {
      id: 'support-1',
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'admin'
    }
  }
];

export default function TestChatWidgetPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState<SupportMessageWithSender[]>(mockMessages);
  const [loading, setLoading] = useState(false);

  const handleBubbleClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
    }
    setIsOpen(!isOpen);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: SupportMessageWithSender = {
      id: `msg-${Date.now()}`,
      conversationId: 'conv-1',
      senderId: 'current-user',
      content,
      isInternalNote: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      sender: {
        id: 'current-user',
        name: 'Test User',
        email: 'user@test.com',
        role: 'client'
      }
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate support response after 2 seconds
    setTimeout(() => {
      const supportResponse: SupportMessageWithSender = {
        id: `support-${Date.now()}`,
        conversationId: 'conv-1',
        senderId: 'support-1',
        content: 'Thanks for your message! I\'ll help you with that right away.',
        isInternalNote: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: 'support-1',
          name: 'Sarah Chen',
          email: 'sarah@company.com',
          role: 'admin'
        }
      };
      
      setMessages(prev => [...prev, supportResponse]);
    }, 2000);
  };

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate loading more messages
    setTimeout(() => {
      const olderMessages: SupportMessageWithSender[] = [
        {
          id: 'older-1',
          conversationId: 'conv-1',
          senderId: 'current-user',
          content: 'Hello, I need some help with my account.',
          isInternalNote: false,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
          updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          sender: {
            id: 'current-user',
            name: 'Test User',
            email: 'user@test.com',
            role: 'client'
          }
        }
      ];
      
      setMessages(prev => [...olderMessages, ...prev]);
      setLoading(false);
    }, 1500);
  };

  const toggleMessages = () => {
    setMessages(prev => prev.length > 0 ? [] : mockMessages);
  };

  return (
    <div className="p-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat Widget Container Test</h1>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleBubbleClick}
                className="btn btn-primary"
              >
                Toggle Widget: {isOpen ? 'Open' : 'Closed'}
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

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="btn btn-ghost"
              >
                Minimized State: {isMinimized ? 'Yes' : 'No'}
              </button>

              <button
                onClick={toggleMessages}
                className="btn btn-outline"
              >
                {messages.length > 0 ? 'Clear Messages' : 'Load Mock Messages'}
              </button>

              <button
                onClick={() => setLoading(!loading)}
                className="btn btn-ghost"
              >
                Loading: {loading ? 'Yes' : 'No'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Widget Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">✅ Implemented Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Slide-up animation from bubble position</li>
                  <li>Header with status indicator and title</li>
                  <li>Minimize and close buttons</li>
                  <li>Complete message list with real chat bubbles</li>
                  <li>Date separators (Today, Yesterday, dates)</li>
                  <li>Message grouping and smart timestamps</li>
                  <li>Auto-scroll to bottom for new messages</li>
                  <li>Load more messages on scroll to top</li>
                  <li>Empty state and loading indicators</li>
                  <li>Input area with textarea and send button</li>
                  <li>File attachment button</li>
                  <li>Live message sending with simulated responses</li>
                  <li>Internal notes support with visual indicators</li>
                  <li>Responsive sizing (mobile full-screen)</li>
                  <li>Keyboard shortcuts (Enter to send)</li>
                  <li>Accessibility features (ARIA labels)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">📱 Responsive Behavior:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Desktop: 384px width, 600px max height</li>
                  <li>Mobile: Full screen minus 2rem margin</li>
                  <li>Positioned above chat bubble</li>
                  <li>Auto-resizing textarea input</li>
                  <li>Touch-friendly button sizing</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click the chat bubble to open the widget</li>
              <li>Notice the smooth slide-up animation and message display</li>
              <li>Scroll up in the message list to test &quot;load more&quot; functionality</li>
              <li>Send a test message and watch for auto-scroll and simulated response</li>
              <li>Test date separators by looking at Yesterday vs Today messages</li>
              <li>Notice message grouping (multiple messages from same sender)</li>
              <li>Test the minimize button (should close and set minimized state)</li>
              <li>Test the close button (should close completely)</li>
              <li>Try &quot;Clear Messages&quot; to test empty state</li>
              <li>Test Enter to send vs Shift+Enter for new line</li>
              <li>Test on mobile viewport for full-screen behavior</li>
              <li>Verify online/offline status changes in header</li>
            </ol>
          </div>

          <div className="card p-6 bg-muted/50">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Widget:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div>
                <span className="font-medium">Minimized:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isMinimized ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isMinimized ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div>
                <span className="font-medium">Unread:</span>
                <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  {unreadCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Components */}
      <ChatBubble
        isOpen={isOpen && !isMinimized}
        onClick={handleBubbleClick}
        unreadCount={unreadCount}
        isOnline={isOnline}
      />

      <ChatWidget
        isOpen={isOpen && !isMinimized}
        onClose={handleClose}
        onMinimize={handleMinimize}
        isOnline={isOnline}
        messages={messages}
        currentUserId="current-user"
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={true}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}