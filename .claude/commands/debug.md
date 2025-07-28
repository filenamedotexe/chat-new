---
description: Debug various aspects of the application
argument-hint: auth | db | api | build | types
allowed-tools: Bash, Read, Grep
---

Debug the specific aspect of the application mentioned in the arguments.

Debugging: $ARGUMENTS

For auth issues:
- Check Supabase configuration in .env.local
- Verify auth middleware in middleware.ts
- Check session handling in lib/supabase/auth-server.ts
- Review login flow in app/(auth)/login/page.tsx

For database issues:
! psql $DATABASE_URL -c "\dt"
- Check if all migrations have been run
- Verify Supabase connection

For API issues:
- Check route handlers in app/api/
- Verify authentication in API routes
- Check error logs in server console

For build issues:
! npm run typecheck
! npm run lint
! npm run build

For type issues:
! npx tsc --noEmit --pretty

Common debugging commands:
! lsof -i :3000  # Check what's using port 3000
! rm -rf .next  # Clear Next.js cache
! npm install  # Reinstall dependencies