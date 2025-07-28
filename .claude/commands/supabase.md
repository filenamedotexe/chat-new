---
description: Supabase-specific operations and debugging
argument-hint: auth | storage | realtime | check
---

Perform Supabase operation: $ARGUMENTS

For "auth" - Debug authentication:
@lib/supabase/auth-server.ts
@lib/supabase/auth-browser.ts
@app/(auth)/login/page.tsx

Check:
- NEXT_PUBLIC_SUPABASE_URL in .env.local
- NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
- SUPABASE_SERVICE_ROLE_KEY in .env.local
- Auth settings in Supabase Dashboard
- Redirect URLs configured in Dashboard

For "storage" - Debug file storage:
@features/files/
Check:
- Storage bucket exists in Supabase
- RLS policies for bucket
- File size limits (25MB default)

For "realtime" - Debug real-time features:
@features/support-chat/hooks/use-conversation-stream.ts
Check:
- Realtime enabled in Supabase Dashboard
- Table replication settings
- WebSocket connections

For "check" - General health check:
- Test authentication flow
- Check database connection
- Verify storage access
- Test real-time subscriptions

Common issues:
1. Auth redirect not working: Check Site URL in Dashboard
2. Storage upload fails: Check bucket policies
3. Realtime not updating: Check table replication
4. CORS errors: Check allowed origins

Supabase Dashboard: https://supabase.com/dashboard/project/ixcsflqtipcfscbloahx