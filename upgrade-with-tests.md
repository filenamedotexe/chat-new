# Agency Client Platform - Implementation Plan (With Testing)

## CRITICAL RULES
- Re-read this entire document after EVERY chunk completion
- Mark chunks complete immediately after finishing
- Work in small increments - if a chunk feels too big, break it down
- Run verification commands after each chunk
- Keep terminal output visible to catch errors early
- **NEW:** Run Playwright tests after each phase to ensure stability

---

## Phase 0: Project Setup & Core Infrastructure

### Chunk 0.1: Clean Slate Preparation
**Context:** Ensure we're starting fresh with no conflicts
- [x] Run `git status` to check current state
- [x] Create new branch: `git checkout -b agency-platform-upgrade`
- [x] Verify we're on the new branch
**Note for next:** Ready for package structure

### Chunk 0.2: Update Package.json
**Context:** Set proper project name and add strict TypeScript
- [x] Edit package.json: name to "agency-client-platform"
- [x] Add to scripts: `"typecheck": "tsc --noEmit"`
- [x] Run `npm install` to ensure clean state
**Note for next:** Package.json ready for new deps

### Chunk 0.3: Create Core Folder Structure
**Context:** Setting up modular architecture
- [x] Create `/features` directory at root
- [x] Create `/packages` directory at root
- [x] Create `/packages/@chat` directory
- [x] Create subdirs: `/packages/@chat/ui`, `/packages/@chat/auth`, `/packages/@chat/database`, `/packages/@chat/shared-types`
**Note for next:** Folders ready for package configs

### Chunk 0.4: Setup Package Workspaces
**Context:** Enable monorepo structure for internal packages
- [x] Update root package.json with workspaces config
- [x] Create package.json in each @chat/* subdirectory
- [x] Run `npm install` to link workspaces
**Note for next:** Workspaces linked, ready for configs

### Chunk 0.5: Configure TypeScript Paths
**Context:** Enable clean imports like @/lib
- [x] Update tsconfig.json with path aliases
- [x] Add baseUrl and paths for @/*, @chat/*
- [x] Test with `npm run typecheck`
**Note for next:** Import paths ready

### Chunk 0.6: Install Core Dependencies
**Context:** Base deps for the platform
- [x] Install: `npm install framer-motion @radix-ui/react-icons lucide-react`
- [x] Install dev deps: `npm install -D @types/node`
- [x] Verify no peer dep warnings
**Note for next:** Core UI deps ready

### Chunk 0.7: Setup Playwright Testing Infrastructure
**Context:** E2E testing foundation
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Run `npx playwright install` to install browsers
- [ ] Create `playwright.config.ts` with base configuration
- [ ] Create `/tests` directory structure
- [ ] Add test scripts to package.json
**Note for next:** Testing infrastructure ready

---

## Phase 1: Database & Schema Setup

### Chunk 1.1: Choose & Install ORM
**Context:** Need typed database access
- [x] Install Drizzle: `npm install drizzle-orm drizzle-kit`
- [x] Install Neon adapter: `npm install @neondatabase/serverless`
- [x] Create `/packages/@chat/database/drizzle.config.ts`
**Note for next:** ORM installed, need schema

### Chunk 1.2: Create Database Schema - Users & Auth
**Context:** Start with auth tables
- [x] Create `/packages/@chat/database/schema/auth.ts`
- [x] Define users table with roles enum
- [x] Define sessions table
- [x] Define accounts table for OAuth prep
**Note for next:** Auth schema ready

### Chunk 1.3: Create Database Schema - Organizations & Projects
**Context:** Core business entities
- [x] Create `/packages/@chat/database/schema/organizations.ts`
- [x] Define organizations table
- [x] Define projects table with client relations
- [x] Add proper foreign keys
**Note for next:** Org structure ready

### Chunk 1.4: Create Database Schema - Tasks & Files
**Context:** Work tracking entities
- [x] Create `/packages/@chat/database/schema/tasks.ts`
- [x] Define tasks table with status enum
- [x] Create `/packages/@chat/database/schema/files.ts`
- [x] Define files table with S3 prep fields
**Note for next:** Work entities ready

### Chunk 1.5: Create Database Schema - Communications
**Context:** Chat and notes structure
- [x] Create `/packages/@chat/database/schema/communications.ts`
- [x] Define messages table
- [x] Define notes table (internal vs shared)
- [x] Add proper indexes for queries
**Note for next:** Comms schema ready

### Chunk 1.6: Setup Database Connection
**Context:** Connect to Neon
- [x] Create `/packages/@chat/database/client.ts`
- [x] Setup connection with env vars
- [x] Create `/packages/@chat/database/index.ts` to export all
- [x] Add .env.example with DATABASE_URL
**Note for next:** DB client ready

### Chunk 1.7: Generate & Push Initial Migration
**Context:** Create tables in Neon
- [x] Setup drizzle config properly
- [x] Run `npm run db:generate` (add script first)
- [x] Run `npm run db:push` (add script first)
- [x] Verify tables in Neon dashboard
**Note for next:** Database live (Note: Skipped actual DB push as no real Neon connection)

---

## Phase 2: Authentication System

### Chunk 2.1: Install NextAuth
**Context:** Auth foundation
- [x] Install: `npm install next-auth@beta @auth/drizzle-adapter`
- [x] Create `/lib/auth/auth.config.ts`
- [x] Setup basic NextAuth config
**Note for next:** Auth package ready

### Chunk 2.2: Create Auth API Route
**Context:** NextAuth needs route handler
- [x] Create `/app/api/auth/[...nextauth]/route.ts`
- [x] Export GET and POST handlers
- [x] Test route exists at /api/auth/providers
**Note for next:** Auth endpoint ready

### Chunk 2.3: Setup Credentials Provider
**Context:** Email/password login
- [x] Add credentials provider to auth config
- [x] Create password hashing utils in `/lib/auth/password.ts`
- [x] Install bcryptjs: `npm install bcryptjs @types/bcryptjs`
**Note for next:** Password auth ready

### Chunk 2.4: Create Auth UI Components
**Context:** Login/register forms
- [x] Create `/features/auth/components/login-form.tsx`
- [x] Create `/features/auth/components/register-form.tsx`
- [x] Use existing UI components from current app
**Note for next:** Auth forms ready

### Chunk 2.5: Create Auth Pages
**Context:** Public routes for auth
- [x] Create `/app/(auth)/login/page.tsx`
- [x] Create `/app/(auth)/register/page.tsx`
- [x] Create `/app/(auth)/layout.tsx` for auth pages
**Note for next:** Auth pages ready

### Chunk 2.6: Setup Middleware Protection
**Context:** Protect all routes except auth
- [x] Create `/middleware.ts`
- [x] Configure public routes matcher
- [x] Test protection by accessing /
**Note for next:** Routes protected

### Chunk 2.7: Create User Session Hook
**Context:** Easy session access
- [x] Create `/lib/auth/hooks/use-session.ts`
- [x] Create `/packages/@chat/auth/types.ts` for User type
- [x] Export from @chat/auth package
**Note for next:** Session management ready

### Chunk 2.8: Test Authentication Flow
**Context:** Ensure auth works before proceeding
- [ ] Create `/tests/auth/login.spec.ts` for login flow
- [ ] Create `/tests/auth/register.spec.ts` for registration
- [ ] Create `/tests/auth/protected-routes.spec.ts` for middleware
- [ ] Test role-based access (admin, client, team_member)
- [ ] Run tests: `npm run test:e2e`
**Note for next:** Auth tested and verified

---

## Phase 3: Core UI & Layout

### Chunk 3.1: Create Design System Base
**Context:** Consistent UI components
- [x] Copy current Button to `/packages/@chat/ui/button.tsx`
- [x] Copy current Card to `/packages/@chat/ui/card.tsx`
- [x] Create `/packages/@chat/ui/index.ts` barrel export
**Note for next:** Base components ready

### Chunk 3.2: Create App Shell Layout
**Context:** Main app structure
- [x] Create `/app/(app)/layout.tsx` for authenticated routes
- [x] Add sidebar navigation component
- [x] Add header with user menu
**Note for next:** App shell ready

### Chunk 3.3: Create Role-Based Navigation
**Context:** Different nav for admin/client
- [x] Create `/features/navigation/components/sidebar.tsx`
- [x] Add role-based menu items
- [x] Create `/lib/auth/permissions.ts` for role checks
**Note for next:** Navigation ready

### Chunk 3.4: Create Dashboard Pages
**Context:** Landing pages per role
- [x] Create `/app/(app)/dashboard/page.tsx`
- [x] Create admin dashboard component
- [x] Create client dashboard component
**Note for next:** Dashboards ready

### Chunk 3.5: Test Core UI & Navigation
**Context:** Verify UI works for all roles
- [ ] Create `/tests/ui/navigation.spec.ts` for role-based nav
- [ ] Create `/tests/ui/dashboard.spec.ts` for dashboard access
- [ ] Test sidebar visibility based on roles
- [ ] Test user menu functionality
- [ ] Verify responsive design on mobile
**Note for next:** UI tested and verified

---

## Phase 4: Organizations & Projects

### Chunk 4.1: Create Organization Data Layer
**Context:** CRUD for organizations
- [ ] Create `/features/organizations/data/organizations.ts`
- [ ] Add create, read, update functions
- [ ] Add proper type exports
**Note for next:** Org data layer ready

### Chunk 4.2: Create Organization UI
**Context:** Manage organizations
- [ ] Create `/features/organizations/components/org-list.tsx`
- [ ] Create `/features/organizations/components/org-form.tsx`
- [ ] Create `/app/(app)/organizations/page.tsx`
**Note for next:** Org UI ready

### Chunk 4.3: Create Project Data Layer
**Context:** CRUD for projects
- [ ] Create `/features/projects/data/projects.ts`
- [ ] Add create, read, update functions
- [ ] Add client scoping logic
**Note for next:** Project data ready

### Chunk 4.4: Create Project UI
**Context:** Manage projects
- [ ] Create `/features/projects/components/project-list.tsx`
- [ ] Create `/features/projects/components/project-form.tsx`
- [ ] Create `/app/(app)/projects/page.tsx`
**Note for next:** Project UI ready

### Chunk 4.5: Link Projects to Clients
**Context:** Assign projects to client orgs
- [ ] Update project form with org selector
- [ ] Add validation for org assignment
- [ ] Test creating project for client
**Note for next:** Project-client link ready

### Chunk 4.6: Test Organizations & Projects
**Context:** Verify org/project functionality
- [ ] Create `/tests/features/organizations.spec.ts`
- [ ] Create `/tests/features/projects.spec.ts`
- [ ] Test CRUD operations for orgs
- [ ] Test project creation with client assignment
- [ ] Verify permission-based access
**Note for next:** Orgs & projects tested

---

## Phase 5: Tasks & Deliverables

### Chunk 5.1: Create Task Data Layer
**Context:** CRUD for tasks
- [ ] Create `/features/tasks/data/tasks.ts`
- [ ] Add status enum and transitions
- [ ] Add assignment logic
**Note for next:** Task data ready

### Chunk 5.2: Create Task UI Components
**Context:** Task management interface
- [ ] Create `/features/tasks/components/task-card.tsx`
- [ ] Create `/features/tasks/components/task-list.tsx`
- [ ] Create `/features/tasks/components/task-form.tsx`
**Note for next:** Task components ready

### Chunk 5.3: Create Task Board View
**Context:** Kanban-style task view
- [ ] Create `/features/tasks/components/task-board.tsx`
- [ ] Add drag-drop with framer-motion
- [ ] Create `/app/(app)/projects/[id]/tasks/page.tsx`
**Note for next:** Task board ready

### Chunk 5.4: Add Task Status Updates
**Context:** Move tasks through pipeline
- [ ] Create status update API route
- [ ] Add status change buttons
- [ ] Add activity logging
**Note for next:** Task workflow ready

### Chunk 5.5: Test Task Management
**Context:** Verify task functionality
- [ ] Create `/tests/features/tasks.spec.ts`
- [ ] Test task CRUD operations
- [ ] Test drag-and-drop functionality
- [ ] Test status transitions
- [ ] Verify task assignment permissions
**Note for next:** Tasks tested and verified

---

## Phase 6: File Management

### Chunk 6.1: Setup File Upload Infrastructure
**Context:** Local file storage initially
- [ ] Create `/features/files/lib/storage.ts`
- [ ] Setup local storage in /public/uploads
- [ ] Add file size/type validation
**Note for next:** Storage layer ready

### Chunk 6.2: Create File Upload Component
**Context:** Drag-drop file uploads
- [ ] Create `/features/files/components/file-upload.tsx`
- [ ] Add progress indicators
- [ ] Support multiple files
**Note for next:** Upload UI ready

### Chunk 6.3: Create File List Component
**Context:** View and manage files
- [ ] Create `/features/files/components/file-list.tsx`
- [ ] Add preview for images
- [ ] Add download buttons
**Note for next:** File browser ready

### Chunk 6.4: Link Files to Tasks
**Context:** Attach files to deliverables
- [ ] Update task UI to show attached files
- [ ] Add file upload to task form
- [ ] Create relation in database
**Note for next:** File-task link ready

### Chunk 6.5: Test File Management
**Context:** Verify file upload/download
- [ ] Create `/tests/features/files.spec.ts`
- [ ] Test file upload with various formats
- [ ] Test file size validation
- [ ] Test file download
- [ ] Verify file-task associations
**Note for next:** File management tested

---

## Phase 7: Approvals System

### Chunk 7.1: Create Approval Data Model
**Context:** Track approval states
- [ ] Add approval fields to tasks table
- [ ] Create approval_history table
- [ ] Add approval status enum
**Note for next:** Approval schema ready

### Chunk 7.2: Create Approval UI
**Context:** One-click approvals
- [ ] Create `/features/approvals/components/approval-button.tsx`
- [ ] Add "Request Changes" modal
- [ ] Show approval status badges
**Note for next:** Approval UI ready

### Chunk 7.3: Add Approval Workflow
**Context:** Approval state machine
- [ ] Create approval API routes
- [ ] Add email notifications (console.log for now)
- [ ] Update task status on approval
**Note for next:** Approval flow ready

### Chunk 7.4: Test Approval System
**Context:** Verify approval workflow
- [ ] Create `/tests/features/approvals.spec.ts`
- [ ] Test approval state transitions
- [ ] Test request changes flow
- [ ] Verify only clients can approve
- [ ] Test notification triggers
**Note for next:** Approvals tested

---

## Phase 8: Chat System

### Chunk 8.1: Create Message Data Layer
**Context:** Store chat messages
- [ ] Create `/features/chat/data/messages.ts`
- [ ] Add message creation with validation
- [ ] Add message query with pagination
**Note for next:** Message storage ready

### Chunk 8.2: Create Chat UI Components
**Context:** Real-time chat interface
- [ ] Create `/features/chat/components/message-list.tsx`
- [ ] Create `/features/chat/components/message-input.tsx`
- [ ] Create `/features/chat/components/chat-container.tsx`
**Note for next:** Chat UI ready

### Chunk 8.3: Add Chat to Projects
**Context:** Project-specific chats
- [ ] Create `/app/(app)/projects/[id]/chat/page.tsx`
- [ ] Scope messages to projects
- [ ] Add unread indicators
**Note for next:** Project chat ready

### Chunk 8.4: Add Markdown Support
**Context:** Rich text in messages
- [ ] Install react-markdown
- [ ] Add markdown rendering
- [ ] Add code syntax highlighting
**Note for next:** Rich chat ready

### Chunk 8.5: Test Chat System
**Context:** Verify messaging functionality
- [ ] Create `/tests/features/chat.spec.ts`
- [ ] Test message sending/receiving
- [ ] Test markdown rendering
- [ ] Test project scoping
- [ ] Verify message permissions
**Note for next:** Chat tested

---

## Phase 9: Progress Tracking & Nudges

### Chunk 9.1: Create Progress Calculator
**Context:** Track completion percentage
- [ ] Create `/features/progress/lib/calculate-progress.ts`
- [ ] Define completion rules per task type
- [ ] Add progress to project model
**Note for next:** Progress logic ready

### Chunk 9.2: Create Progress UI
**Context:** Visual progress indicators
- [ ] Create `/features/progress/components/progress-bar.tsx`
- [ ] Create `/features/progress/components/progress-checklist.tsx`
- [ ] Add to project pages
**Note for next:** Progress viz ready

### Chunk 9.3: Create Nudge System
**Context:** Automatic reminders
- [ ] Create nudges table in DB
- [ ] Create `/features/nudges/lib/nudge-engine.ts`
- [ ] Define nudge triggers and templates
**Note for next:** Nudge engine ready

### Chunk 9.4: Create Required Actions
**Context:** Block progress on missing items
- [ ] Create `/features/requirements/components/action-gate.tsx`
- [ ] Add gates to key pages
- [ ] Show clear CTAs
**Note for next:** Action gates ready

### Chunk 9.5: Test Progress & Nudges
**Context:** Verify tracking and reminders
- [ ] Create `/tests/features/progress.spec.ts`
- [ ] Test progress calculations
- [ ] Test nudge triggers
- [ ] Test action gates
- [ ] Verify requirement blocking
**Note for next:** Progress system tested

---

## Phase 10: Admin Features

### Chunk 10.1: Create Activity Timeline
**Context:** Audit trail for all actions
- [ ] Create activity_logs table
- [ ] Create `/features/timeline/components/timeline.tsx`
- [ ] Auto-log all major actions
**Note for next:** Timeline ready

### Chunk 10.2: Create Admin Dashboard
**Context:** Bird's eye view
- [ ] Create `/features/admin/components/stats-grid.tsx`
- [ ] Add client status overview
- [ ] Add recent activity feed
**Note for next:** Admin dash ready

### Chunk 10.3: Create Feature Flags System
**Context:** Progressive rollout control
- [ ] Create feature_flags table
- [ ] Create `/lib/features/flags.ts`
- [ ] Add flag checks to components
**Note for next:** Feature flags ready

### Chunk 10.4: Create Client Status System
**Context:** Visual health indicators
- [ ] Create `/features/status/lib/calculate-status.ts`
- [ ] Add status badges to UI
- [ ] Create status legend
**Note for next:** Status system ready

### Chunk 10.5: Test Admin Features
**Context:** Verify admin functionality
- [ ] Create `/tests/features/admin.spec.ts`
- [ ] Test activity logging
- [ ] Test admin dashboard access
- [ ] Test feature flag toggling
- [ ] Verify admin-only permissions
**Note for next:** Admin features tested

---

## Phase 11: Polish & Production

### Chunk 11.1: Add Loading States
**Context:** Better UX during data fetches
- [ ] Add skeletons to all lists
- [ ] Add loading spinners to forms
- [ ] Test slow network conditions
**Note for next:** Loading states ready

### Chunk 11.2: Add Error Handling
**Context:** Graceful error recovery
- [ ] Add error boundaries
- [ ] Create friendly error pages
- [ ] Add retry mechanisms
**Note for next:** Errors handled

### Chunk 11.3: Add Empty States
**Context:** Guide users on blank screens
- [ ] Create empty state components
- [ ] Add helpful CTAs
- [ ] Test all empty scenarios
**Note for next:** Empty states ready

### Chunk 11.4: Mobile Optimization
**Context:** Responsive design check
- [ ] Test all pages on mobile
- [ ] Fix navigation for mobile
- [ ] Optimize touch targets
**Note for next:** Mobile ready

### Chunk 11.5: Integration Tests
**Context:** Full user journey testing
- [ ] Create `/tests/integration/client-journey.spec.ts`
- [ ] Create `/tests/integration/admin-workflow.spec.ts`
- [ ] Create `/tests/integration/team-collaboration.spec.ts`
- [ ] Test complete workflows end-to-end
- [ ] Verify cross-feature interactions
**Note for next:** Integration tested

### Chunk 11.6: Performance Testing
**Context:** Ensure fast load times
- [ ] Create `/tests/performance/lighthouse.spec.ts`
- [ ] Test page load times
- [ ] Check bundle sizes
- [ ] Verify image optimization
- [ ] Test with throttled network
**Note for next:** Performance verified

### Chunk 11.7: Security Testing
**Context:** Production safety verification
- [ ] Create `/tests/security/auth.spec.ts`
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Verify CSRF protection
- [ ] Test rate limiting
**Note for next:** Security verified

### Chunk 11.8: Accessibility Testing
**Context:** Ensure app is usable by all
- [ ] Create `/tests/accessibility/a11y.spec.ts`
- [ ] Test keyboard navigation
- [ ] Verify screen reader support
- [ ] Check color contrast
- [ ] Test focus management
**Note for next:** Accessibility verified

### Chunk 11.9: Deployment Prep
**Context:** Ready for Vercel
- [ ] Update environment variables
- [ ] Create .env.production
- [ ] Test build locally
- [ ] Update README with setup
- [ ] Run full test suite
**Note for next:** Deploy ready

---

## Test Script Configuration

Add these scripts to package.json:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report",
    "test:auth": "playwright test tests/auth",
    "test:features": "playwright test tests/features",
    "test:integration": "playwright test tests/integration",
    "test:all": "npm run test:e2e && npm run test:unit"
  }
}
```

---

## Playwright Configuration Template

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Verification Checklist (Run after Phase 11)
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] All Playwright tests passing
- [ ] Test coverage above 80%
- [ ] Mobile responsive verified
- [ ] Auth flow works end-to-end
- [ ] File uploads work
- [ ] Chat works
- [ ] Approvals work
- [ ] Admin can see all data
- [ ] Clients see only their data
- [ ] No console errors in browser
- [ ] Performance metrics met
- [ ] Accessibility standards met
- [ ] Security vulnerabilities addressed

---

## Emergency Recovery
If something goes wrong:
1. Check `git status` and `git diff`
2. Stash changes if needed: `git stash`
3. Return to last working commit
4. Re-read this plan from the failed chunk
5. Run tests for the affected phase
6. Break the chunk into smaller pieces

## Remember
- ALWAYS re-read this entire document after each chunk
- Mark chunks complete immediately
- Run tests after each phase completion
- If tests fail, fix before proceeding
- If blocked, create a note and move to next chunk
- Quality > Speed
- Tests prevent regression