'use client';

import { useState } from 'react';
import { ChatBubble, ChatWidget } from '@/features/support-chat';

export default function TestDebugChatPage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleBubbleClick = () => {
    console.log('Bubble clicked! Current isOpen:', isOpen);
    setIsOpen(!isOpen);
    console.log('Setting isOpen to:', !isOpen);
  };

  console.log('Rendering: isOpen =', isOpen);

  return (
    <div className="p-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Chat Test</h1>
        
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <p>Chat Widget Open: <strong>{isOpen ? 'YES' : 'NO'}</strong></p>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-primary mt-4"
          >
            Toggle Widget: {isOpen ? 'Close' : 'Open'}
          </button>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check the debug info above</li>
            <li>Click the floating chat bubble (bottom-right)</li>
            <li>Watch the debug info change</li>
            <li>Look for the chat widget animation</li>
            <li>Use the toggle button to test manually</li>
          </ol>
        </div>
      </div>

      {/* Chat Components */}
      <ChatBubble
        isOpen={isOpen}
        onClick={handleBubbleClick}
        unreadCount={3}
        isOnline={true}
      />

      {/* Simple test widget without animations */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50"
          style={{ display: 'block' }}
        >
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold">Debug Chat Widget</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <p>Widget is visible!</p>
            <p>isOpen: {isOpen.toString()}</p>
          </div>
        </div>
      )}

      {/* Original ChatWidget for comparison */}
      <ChatWidget
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMinimize={() => setIsOpen(false)}
        isOnline={true}
        messages={[]}
        currentUserId="debug-user"
        loading={false}
        onSendMessage={(content: string) => console.log('Message sent:', content)}
      />
    </div>
  );
}