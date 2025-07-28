---
description: Create a new feature following the modular architecture
argument-hint: feature-name
---

Create a new feature called "$ARGUMENTS" following the project's modular architecture.

Think step by step about creating this feature:

1. Create the feature directory structure:
   - features/$ARGUMENTS/
   - features/$ARGUMENTS/components/
   - features/$ARGUMENTS/hooks/
   - features/$ARGUMENTS/lib/
   - features/$ARGUMENTS/types/
   - features/$ARGUMENTS/index.ts (barrel export)

2. Create the main components following existing patterns in other features

3. Add TypeScript types in types/index.ts

4. Create data access functions in lib/ if needed

5. Add custom hooks in hooks/ for state management

6. Create the page route in app/(protected)/$ARGUMENTS/page.tsx

7. Add navigation link in the sidebar

8. Write Playwright tests in tests/$ARGUMENTS.spec.ts

9. Update feature flags if needed

Follow these patterns:
@features/support-chat/
@features/tasks/
@features/projects/

Use Supabase for:
- Authentication (via @/lib/supabase/auth-server.ts)
- Database queries
- Real-time subscriptions
- File storage

Remember to:
- Use TypeScript strict mode
- Add data-testid attributes for testing
- Follow the existing UI component patterns from @chat/ui
- Implement proper error handling
- Add loading states
- Make it responsive