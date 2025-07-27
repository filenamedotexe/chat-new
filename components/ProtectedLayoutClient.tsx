'use client';

import { Layout, Header, ErrorBoundary, Breadcrumbs, MobileBreadcrumbs } from '@chat/ui';
import { Navigation } from './Navigation';
import { MobileMenuProvider } from '@/lib/contexts/mobile-menu-context';
import { useState } from 'react';
import { ChatBubble, ChatWidget } from '@/features/support-chat';
import type { UserRole } from '@chat/shared-types';

interface ProtectedLayoutClientProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  children: React.ReactNode;
}

export function ProtectedLayoutClient({ user, children }: ProtectedLayoutClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatBubbleClick = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <MobileMenuProvider>
      <Layout>
        <Navigation user={user} />
        <Header>
          <Navigation.Header user={user} />
        </Header>
        {/* Breadcrumbs below header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-2">
            {/* Desktop breadcrumbs */}
            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
            {/* Mobile breadcrumbs */}
            <div className="md:hidden">
              <MobileBreadcrumbs />
            </div>
          </div>
        </div>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        
        {/* Chat System - Available for all authenticated users */}
        <ChatBubble
          isOpen={isChatOpen}
          isOnline={true}
          unreadCount={3}
          onClick={handleChatBubbleClick}
        />

        <ChatWidget
          isOpen={isChatOpen}
          onClose={handleChatClose}
          onMinimize={handleChatClose}
          isOnline={true}
          messages={[]}
          currentUserId={user.id}
          loading={false}
          onSendMessage={async (content: string, files?: File[]) => {
            console.log('Message sent:', content, files ? `with ${files.length} files` : '');
            
            // For now, simulate message sending with file handling
            if (files && files.length > 0) {
              console.log('Files to upload:');
              files.forEach((file, index) => {
                console.log(`  ${index + 1}. ${file.name} (${Math.round(file.size / 1024)}KB, ${file.type})`);
              });
              
              // Simulate file upload process
              try {
                console.log('Simulating file upload...');
                
                // Create a FormData to test the upload
                const formData = new FormData();
                files.forEach(file => {
                  formData.append('files', file);
                });
                
                // For demo purposes, just show success
                console.log('✅ Files processed successfully!');
                
                // In Phase 2.5, this will be real API calls:
                // const response = await fetch(`/api/conversations/${conversationId}/files`, {
                //   method: 'POST',
                //   body: formData
                // });
                
              } catch (error) {
                console.error('❌ File upload error:', error);
              }
            }
            
            // TODO: Implement actual message sending in Phase 2.5
          }}
        />
      </Layout>
    </MobileMenuProvider>
  );
}