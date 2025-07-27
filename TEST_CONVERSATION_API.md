# Testing Conversation API Routes

## Routes Implemented

### 1. GET /api/conversations
- **Purpose**: Get list of conversations
- **Auth Required**: Yes
- **Role Logic**:
  - `admin` or `team_member`: Returns all active conversations
  - `user` or `client`: Returns only their own conversation
  - Others: Returns 403 Forbidden

### 2. POST /api/conversations  
- **Purpose**: Create/get conversation for current user
- **Auth Required**: Yes
- **Role Logic**:
  - `user` or `client`: Creates or gets their existing conversation
  - `admin` or `team_member`: Returns 403 (only clients can initiate)

## Manual Testing Instructions

### 1. Start the development server
```bash
npm run dev
```

### 2. Login to the app
- Go to http://localhost:3000/login
- Use existing credentials or create a new account

### 3. Test with cURL (get session cookie from browser)

**Get your session cookie:**
1. Open DevTools (F12)
2. Go to Application > Cookies
3. Find `next-auth.session-token` 
4. Copy the value

**Test GET /api/conversations:**
```bash
# Replace YOUR_SESSION_TOKEN with actual token
curl -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/conversations
```

**Test POST /api/conversations:**
```bash
curl -X POST \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/conversations
```

### 4. Test in Browser Console

Open browser console and run:

```javascript
// Test GET
fetch('/api/conversations', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test POST  
fetch('/api/conversations', { 
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Expected Responses

### Successful GET (admin/team_member):
```json
{
  "conversations": [
    {
      "id": "...",
      "clientId": "...",
      "status": "active",
      "priority": "normal",
      "client": { "email": "...", "name": "..." },
      "unreadCount": 0,
      "lastMessage": { ... }
    }
  ],
  "total": 1
}
```

### Successful GET (user/client):
```json
{
  "conversations": [
    {
      "id": "...",
      "clientId": "...",
      "status": "active",
      "priority": "normal"
    }
  ],
  "total": 1
}
```

### Successful POST (user/client):
```json
{
  "conversation": {
    "id": "...",
    "clientId": "...",
    "status": "active",
    "priority": "normal"
  },
  "created": true
}
```

### Error Responses:
- 401: Not authenticated
- 403: Role not allowed for this operation
- 500: Server error (check logs)

## Implementation Checklist

✅ GET /api/conversations
- ✅ Auth check
- ✅ Role-based response (admin/team_member see all, users see own)
- ✅ Uses getActiveConversations() for admins
- ✅ Uses getOrCreateClientConversation() for users
- ✅ Returns proper error codes

✅ POST /api/conversations  
- ✅ Auth check
- ✅ Role check (only user/client can create)
- ✅ Uses getOrCreateClientConversation()
- ✅ Returns existing or new conversation
- ✅ Returns proper error codes

## Next Steps

Continue with:
- 1.3.3: GET /api/conversations/[id]
- 1.3.4: PATCH /api/conversations/[id]
- 1.3.5: GET /api/conversations/[id]/messages
- 1.3.6: POST /api/conversations/[id]/messages