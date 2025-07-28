---
description: Fix common issues in the codebase
argument-hint: types | imports | lint | build | test
---

Fix the issue: $ARGUMENTS

Think step by step about what needs to be fixed.

For "types" - Fix TypeScript errors:
! npm run typecheck
Then fix any type errors found, ensuring:
- Proper type imports from @chat/shared-types
- No use of 'any' type
- Proper null/undefined handling

For "imports" - Fix import issues:
Look for:
- Missing imports
- Circular dependencies
- Incorrect import paths
- Client/server code separation

For "lint" - Fix ESLint issues:
! npm run lint
Then fix:
- Unused variables
- Missing dependencies in hooks
- Formatting issues

For "build" - Fix build errors:
! npm run build
Common fixes:
- Server/client component issues ('use client' directive)
- Dynamic imports for client-only code
- Environment variable issues

For "test" - Fix failing tests:
! npm run test
Look for:
- Outdated selectors
- Changed URLs
- Missing test data
- Timing issues

General debugging:
! rm -rf .next
! rm -rf node_modules/.cache
! npm install

Always run tests after fixing to ensure nothing broke.