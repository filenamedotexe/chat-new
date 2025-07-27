# Chat Feature Overhaul - Implementation Plan

## Overview
Complete overhaul of chat functionality into a unified customer support system with floating widget for clients and conversation management dashboard for admins/managers.

## Architecture Principles
- **Modular**: Isolated feature in `/features/support-chat/` directory
- **Reusable**: Leverage existing auth, database, UI components
- **Progressive**: Feature flag controlled rollout
- **Simple**: SSE + polling instead of complex WebSockets
- **Maintainable**: Clear separation of concerns

## Phase 0: Preparation & Cleanup

### Chunk 0.1: Remove Project-Level Chat
**Why**: No business need for project-level chat
- [ ] Delete `/app/(protected)/projects/[id]/chat/page.tsx`
- [ ] Remove chat links from project detail pages
- [ ] Remove project chat references from navigation
- [ ] Clean up any project-specific chat components
**Verify**: No broken links to project chat

### Chunk 0.2: Rename Task Chat to Comments
**Why**: Task discussions are actually comments, not chat
- [ ] Rename "Discussion" to "Comments" in task detail UI
- [ ] Update button text from "View Discussion" to "View Comments"
- [ ] Update route from `/tasks/[id]/chat` to `/tasks/[id]/comments`
- [ ] Update any references in navigation or links
- [ ] Keep using existing chat components (they work fine for comments)
**Verify**: Task comments still work, terminology is consistent

### Chunk 0.3: Create Feature Structure
**Why**: Isolated feature development
- [ ] Create `/features/support-chat/` directory
- [ ] Create subdirectories: `components/`, `hooks/`, `lib/`, `types/`
- [ ] Create `/features/support-chat/index.ts` barrel export
- [ ] Add to feature flags: `SUPPORT_CHAT: 'supportChat'` in constants
**Verify**: Feature structure ready

## Phase 1: Data Layer & API

### Chunk 1.1: Enhance Database Schema
**Why**: Need conversation grouping and read status
```sql
-- Add to messages table
ALTER TABLE messages ADD COLUMN conversation_id UUID;
ALTER TABLE messages ADD COLUMN is_internal_note BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN read_at TIMESTAMP;

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  assigned_to UUID REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'normal',
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```
**Verify**: Migration runs successfully

### Chunk 1.2: Create Conversation Data Layer
**Why**: CRUD operations for conversations
- [ ] Create `/features/support-chat/lib/conversations.ts`
- [ ] Implement: `createConversation`, `getConversation`, `updateConversation`
- [ ] Implement: `getActiveConversations` (for admin dashboard)
- [ ] Implement: `getConversationMessages` with pagination
- [ ] Add proper TypeScript types in `/features/support-chat/types/index.ts`
**Verify**: Can create and query conversations

### Chunk 1.3: Create API Routes
**Why**: HTTP endpoints for chat operations
- [ ] Create `/app/api/conversations/route.ts` (GET list, POST create)
- [ ] Create `/app/api/conversations/[id]/route.ts` (GET single, PATCH update)
- [ ] Create `/app/api/conversations/[id]/messages/route.ts` (GET messages, POST message)
- [ ] Add role-based auth checks (clients see own, admins see all)
- [ ] Add validation for message content, conversation status
**Verify**: API routes work with Postman/curl

### Chunk 1.4: Implement SSE Endpoint
**Why**: Real-time updates without WebSocket complexity
- [ ] Create `/app/api/conversations/[id]/stream/route.ts`
- [ ] Implement Server-Sent Events for new messages
- [ ] Add heartbeat to keep connection alive
- [ ] Handle reconnection gracefully
- [ ] Test with multiple concurrent connections
**Verify**: SSE streams messages in real-time

## Phase 2: Client-Side Chat Widget

### Chunk 2.1: Create Chat Bubble Component
**Why**: Entry point for clients
- [ ] Create `/features/support-chat/components/chat-bubble.tsx`
- [ ] Fixed position bottom-right (bottom-20 right-6)
- [ ] Show online/offline status indicator
- [ ] Unread message count badge
- [ ] Smooth scale animation on mount
- [ ] Mobile positioning adjustments
**Verify**: Bubble appears on all pages

### Chunk 2.2: Create Chat Widget Container
**Why**: Main chat interface
- [ ] Create `/features/support-chat/components/chat-widget.tsx`
- [ ] Slide-up animation from bubble
- [ ] Header with minimize/close buttons
- [ ] Message list area with virtualization
- [ ] Input area with file upload button
- [ ] Responsive height (max 600px desktop, full screen mobile)
**Verify**: Widget opens/closes smoothly

### Chunk 2.3: Implement Message List
**Why**: Display conversation history
- [ ] Create `/features/support-chat/components/message-list.tsx`
- [ ] Reuse existing `ChatBubble` component from UI package
- [ ] Auto-scroll to bottom on new messages
- [ ] Show date separators
- [ ] Load more on scroll up
- [ ] Handle empty state
**Verify**: Messages display correctly

### Chunk 2.4: Implement Message Input
**Why**: Send messages and files
- [ ] Create `/features/support-chat/components/message-input.tsx`
- [ ] Text input with shift+enter for new line
- [ ] Send button with loading state
- [ ] File upload using existing file system
- [ ] Character limit (1000 chars)
- [ ] Disabled state when offline
**Verify**: Can send messages and files

### Chunk 2.5: Add Real-time Updates
**Why**: Live chat experience
- [ ] Create `/features/support-chat/hooks/use-conversation.ts`
- [ ] Implement SSE connection management
- [ ] Poll for messages as fallback (3 second interval)
- [ ] Update unread count in real-time
- [ ] Show typing indicators
- [ ] Handle connection errors gracefully
**Verify**: Messages appear instantly

### Chunk 2.6: Add Widget Polish
**Why**: Professional feel
- [ ] Add business hours indicator
- [ ] Show "We'll be back at X" when offline
- [ ] Add subtle sound for new messages (optional)
- [ ] Desktop notification permission request
- [ ] Persist widget open/closed state
- [ ] Smooth transitions everywhere
**Verify**: Feels premium but not overdesigned

## Phase 3: Admin Conversation Dashboard

### Chunk 3.1: Create Conversations List Page
**Why**: Central hub for support
- [ ] Create `/app/(protected)/admin/conversations/page.tsx`
- [ ] Add to admin navigation menu
- [ ] Show list of active conversations
- [ ] Real-time updates for new messages
- [ ] Sort by "needs response" automatically
**Verify**: Page accessible to admins only

### Chunk 3.2: Create Conversation List Component
**Why**: Sidebar navigation
- [ ] Create `/features/support-chat/components/conversation-list.tsx`
- [ ] Show client name and avatar
- [ ] Last message preview (truncated)
- [ ] Unread indicator (red dot)
- [ ] Time since last message
- [ ] Active conversation highlighting
**Verify**: Can see all conversations

### Chunk 3.3: Create Conversation View Component
**Why**: Main chat interface for admins
- [ ] Create `/features/support-chat/components/conversation-view.tsx`
- [ ] Reuse message list component
- [ ] Show client info card (name, email, current project)
- [ ] Message input at bottom
- [ ] Internal notes section (collapsible)
**Verify**: Can view and respond to chats

### Chunk 3.4: Add Admin Actions
**Why**: Manage conversations efficiently
- [ ] Create `/features/support-chat/components/conversation-actions.tsx`
- [ ] Assign to team member dropdown
- [ ] Mark as resolved button
- [ ] Add internal note modal
- [ ] Priority toggle (high/normal/low)
- [ ] Reopen closed conversations
**Verify**: All actions update database

### Chunk 3.5: Add Admin Polish
**Why**: Productivity features
- [ ] Show "is typing" indicators
- [ ] Add keyboard shortcuts (Cmd+Enter to send)
- [ ] Quick filters (unread, assigned to me, high priority)
- [ ] Bulk actions (mark all read)
- [ ] Export conversation history
**Verify**: Admins can work efficiently

## Phase 4: Integration & Testing

### Chunk 4.1: Add to Protected Layout
**Why**: Widget available everywhere for clients
- [ ] Update `/app/(protected)/layout.tsx`
- [ ] Conditionally render ChatBubble for client role
- [ ] Check feature flag before rendering
- [ ] Pass user context to widget
**Verify**: Clients see chat bubble

### Chunk 4.2: Create Cypress Tests
**Why**: Ensure reliability
- [ ] Test chat bubble appearance for clients
- [ ] Test sending and receiving messages
- [ ] Test file uploads in chat
- [ ] Test admin conversation management
- [ ] Test role-based access control
- [ ] Test offline/online states
**Verify**: All tests passing

### Chunk 4.3: Performance Optimization
**Why**: Smooth experience
- [ ] Implement message virtualization for long conversations
- [ ] Add caching for conversation list
- [ ] Optimize bundle size (lazy load chat widget)
- [ ] Add loading skeletons
- [ ] Test with throttled network
**Verify**: Performs well on 3G

### Chunk 4.4: Add Monitoring
**Why**: Track usage and issues
- [ ] Add event tracking for chat opens
- [ ] Track message send success/failure
- [ ] Monitor SSE connection health
- [ ] Log errors to console (dev) or service (prod)
- [ ] Add basic analytics hooks
**Verify**: Can see usage patterns

## Phase 5: Migration & Launch

### Chunk 5.1: Create Migration Scripts
**Why**: Smooth transition
- [ ] Script to convert existing DMs to conversations
- [ ] Script to set up initial conversation states
- [ ] Test migration on copy of production data
- [ ] Create rollback plan
**Verify**: Migration runs without data loss

### Chunk 5.2: Feature Flag Rollout
**Why**: Gradual deployment
- [ ] Enable for internal team first
- [ ] Create feedback collection mechanism
- [ ] Fix any critical issues
- [ ] Enable for 10% of clients
- [ ] Monitor for a week
**Verify**: No major issues reported

### Chunk 5.3: Documentation
**Why**: Help adoption
- [ ] Create user guide for clients
- [ ] Create admin guide for support team
- [ ] Add to main README
- [ ] Create troubleshooting guide
**Verify**: Documentation is clear

### Chunk 5.4: Full Launch
**Why**: Complete the rollout
- [ ] Enable for all users
- [ ] Send announcement to clients
- [ ] Monitor closely for first 48 hours
- [ ] Collect feedback actively
- [ ] Plan iteration based on usage
**Verify**: Successful launch

## Technical Notes

### State Management
```typescript
// Client side state (zustand or useState)
interface ChatState {
  isOpen: boolean;
  conversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  isTyping: boolean;
}

// Admin side - may want React Query for caching
```

### SEO/Performance Considerations
- Lazy load chat widget with dynamic import
- Use CSS containment for widget
- Implement virtual scrolling for long message lists
- Cache conversation list for 30 seconds
- Prefetch common responses

### Security Considerations
- Validate all message content (XSS prevention)
- Rate limit message sending (10/minute)
- Ensure conversation isolation (no client sees others' chats)
- Sanitize file uploads through existing system
- Add CSRF protection to API routes

### Future Hooks (Don't Build Yet)
- SMS webhook endpoint: `/api/webhooks/sms`
- Email webhook endpoint: `/api/webhooks/email`
- AI response endpoint: `/api/conversations/[id]/ai-suggest`
- Workflow trigger points in message send flow
- Analytics event emitters throughout

## Success Metrics
- Widget load time < 100ms
- Message delivery < 500ms
- 80%+ clients use chat within first month
- Average response time < 5 minutes
- Zero data leaks between clients

## Remember
- Simple > Complex
- Working > Perfect  
- Test everything with Cypress
- Keep existing patterns (modular features)
- Ship iteratively, not all at once