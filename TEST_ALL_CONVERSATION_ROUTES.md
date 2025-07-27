# Complete Conversation API Testing Guide

## All Routes Implemented

### 1. Conversations
- ✅ GET /api/conversations - List conversations
- ✅ POST /api/conversations - Create/get conversation

### 2. Single Conversation
- ✅ GET /api/conversations/[id] - Get conversation with messages
- ✅ PATCH /api/conversations/[id] - Update conversation

### 3. Messages
- ✅ GET /api/conversations/[id]/messages - Get paginated messages
- ✅ POST /api/conversations/[id]/messages - Send a message

## Auth & Role Checks Summary

All routes have:
- ✅ Authentication check (401 if not logged in)
- ✅ Role-based permissions
- ✅ Proper error handling

## Test Commands

### 1. Test Authentication
```bash
# Should return 401
curl http://localhost:3000/api/conversations
```

### 2. Get Session Cookie
1. Login at http://localhost:3000/login
2. Open DevTools > Application > Cookies
3. Copy `next-auth.session-token` value

### 3. Test All Routes

Replace `YOUR_TOKEN` with actual session token and `CONV_ID` with a real conversation ID.

```bash
# List conversations
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/conversations

# Create/get conversation (clients only)
curl -X POST \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/conversations

# Get specific conversation with messages
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/conversations/CONV_ID

# Update conversation (admin/team only)
curl -X PATCH \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority":"high","status":"active"}' \
  http://localhost:3000/api/conversations/CONV_ID

# Get messages with pagination
curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  "http://localhost:3000/api/conversations/CONV_ID/messages?limit=20&offset=0"

# Send a message
curl -X POST \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, I need help!"}' \
  http://localhost:3000/api/conversations/CONV_ID/messages

# Send internal note (admin/team only)
curl -X POST \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Customer seems confused","isInternalNote":true}' \
  http://localhost:3000/api/conversations/CONV_ID/messages
```

## Browser Console Tests

```javascript
// Test conversation list
fetch('/api/conversations', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);

// Create conversation (if client)
fetch('/api/conversations', { 
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log);

// Get conversation ID from above, then:
const convId = 'YOUR_CONVERSATION_ID';

// Get conversation details
fetch(`/api/conversations/${convId}`, { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);

// Send message
fetch(`/api/conversations/${convId}/messages`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'Test message from browser!' })
}).then(r => r.json()).then(console.log);

// Update conversation (admin only)
fetch(`/api/conversations/${convId}`, {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priority: 'high' })
}).then(r => r.json()).then(console.log);
```

## Expected Responses

### GET /api/conversations (admin view)
```json
{
  "conversations": [{
    "id": "...",
    "clientId": "...",
    "status": "active",
    "priority": "normal",
    "client": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "unreadCount": 2,
    "lastMessage": {
      "id": "...",
      "content": "Thanks for your help!",
      "createdAt": "2024-01-20T..."
    }
  }],
  "total": 1
}
```

### POST /api/conversations/[id]/messages
```json
{
  "message": {
    "id": "...",
    "conversationId": "...",
    "senderId": "...",
    "content": "Hello, I need help!",
    "isInternalNote": false,
    "createdAt": "2024-01-20T...",
    "updatedAt": "2024-01-20T..."
  },
  "created": true
}
```

## Role Permissions Matrix

| Route | Client | Admin | Team Member |
|-------|--------|-------|-------------|
| GET /api/conversations | ✅ Own only | ✅ All | ✅ All |
| POST /api/conversations | ✅ | ❌ | ❌ |
| GET /api/conversations/[id] | ✅ Own only | ✅ | ✅ |
| PATCH /api/conversations/[id] | ❌ | ✅ | ✅ |
| GET /api/conversations/[id]/messages | ✅ Own only | ✅ | ✅ |
| POST /api/conversations/[id]/messages | ✅ Own only | ✅ | ✅ |
| Internal notes | ❌ View/Create | ✅ | ✅ |

## Error Codes

- 401: Not authenticated
- 403: Forbidden (wrong role)
- 404: Conversation not found
- 400: Bad request (invalid data)
- 500: Server error

## Validation Rules

1. **Message content**: Required, 1-1000 characters
2. **Status**: Must be 'active' or 'resolved'
3. **Priority**: Must be 'high', 'normal', or 'low'
4. **Pagination**: limit max 100, offset >= 0

## ✅ Implementation Complete

All routes are:
1. Created with proper file structure
2. Include authentication checks
3. Have role-based permissions
4. Return appropriate status codes
5. Handle errors gracefully
6. Use the conversation data layer
7. Filter internal notes for clients
8. Support pagination where needed