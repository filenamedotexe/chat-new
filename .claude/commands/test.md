---
description: Run Playwright tests with various options
argument-hint: [test-name] | ui | headed | all
---

Run the appropriate Playwright tests based on the arguments provided.

$ARGUMENTS

! npm run test

If specific test requested, run:
! npx playwright test tests/$ARGUMENTS.spec.ts

If "ui" argument provided, run tests in UI mode:
! npm run test:ui

If "headed" argument provided, run tests with browser visible:
! npm run test:headed

Always ensure the development server is running on port 3000 before running tests.

Test users available:
- Admin: admin@test.com / password123
- Team Member: team@test.com / password123
- Client: client@test.com / password123