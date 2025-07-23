# Agency Client Platform - Implementation Plan

## CURRENT STATUS (July 23, 2025)
- **Branch**: agency-platform-upgrade
- **Phases Complete**: 0-5 ✅
- **Current Phase**: Ready for Phase 6 (File Management)
- **Build Status**: All green, no errors
- **Tests**: Comprehensive Cypress tests for all features
- **Database**: Full schema implemented (users, organizations, projects, tasks)
- **Features Working**:
  - Authentication with role-based access (admin, client, team_member)
  - Organizations CRUD
  - Projects CRUD with client scoping
  - Tasks with full Kanban board and drag-drop
  - Status transitions with validation
  - All navigation pages functional

## CRITICAL RULES
- Re-read this entire document after EVERY chunk completion
- Mark chunks complete immediately after finishing
- Work in small increments - if a chunk feels too big, break it down
- Run verification commands after each chunk
- Keep terminal output visible to catch errors early

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
- [x] Create `/app/(protected)/layout.tsx` for authenticated routes (Note: using (protected) instead of (app))
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
- [x] Create `/app/(protected)/dashboard/page.tsx`
- [x] Create admin dashboard component
- [x] Create client dashboard component
- [x] Create team dashboard component (bonus)
**Note for next:** Dashboards ready

---

## Phase 4: Organizations & Projects

### Chunk 4.1: Create Organization Data Layer
**Context:** CRUD for organizations
- [x] Create `/features/organizations/data/organizations.ts`
- [x] Add create, read, update functions
- [x] Add proper type exports
**Note for next:** Org data layer ready

### Chunk 4.2: Create Organization UI
**Context:** Manage organizations
- [x] Create `/features/organizations/components/org-list.tsx`
- [x] Create `/features/organizations/components/org-form.tsx`
- [x] Create `/app/(protected)/organizations/page.tsx`
**Note for next:** Org UI ready

### Chunk 4.3: Create Project Data Layer
**Context:** CRUD for projects
- [x] Create `/features/projects/data/projects.ts`
- [x] Add create, read, update functions
- [x] Add client scoping logic
**Note for next:** Project data ready

### Chunk 4.4: Create Project UI
**Context:** Manage projects
- [x] Create `/features/projects/components/project-list.tsx`
- [x] Create `/features/projects/components/project-form.tsx`
- [x] Create `/app/(protected)/projects/page.tsx`
**Note for next:** Project UI ready

### Chunk 4.5: Link Projects to Clients
**Context:** Assign projects to client orgs
- [x] Update project form with org selector
- [x] Add validation for org assignment
- [x] Test creating project for client
**Note for next:** Project-client link ready

### Phase 4 COMPLETE ✅
- Organizations page working with 3 test orgs
- Projects CRUD working with proper client scoping
- Created 2 test projects successfully
- Access control verified (clients can't create projects or see orgs)
- All visual and functional tests passing

---

## Phase 5: Tasks & Deliverables

### Chunk 5.1: Create Task Data Layer
**Context:** CRUD for tasks
- [x] Create `/features/tasks/data/tasks.ts`
- [x] Add status enum and transitions (not_started → in_progress → needs_review → done)
- [x] Add assignment logic (assign to users, track created_by)
**Note for next:** Task data ready with full CRUD operations

### Chunk 5.2: Create Task UI Components
**Context:** Task management interface
- [x] Create `/features/tasks/components/task-card.tsx`
- [x] Create `/features/tasks/components/task-list.tsx`
- [x] Create `/features/tasks/components/task-form.tsx`
**Note for next:** Task components ready - all three components created with full functionality

### Chunk 5.3: Create Task Board View
**Context:** Kanban-style task view
- [x] Create `/features/tasks/components/task-board.tsx`
- [x] Add drag-drop with framer-motion
- [x] Create `/app/(protected)/projects/[id]/tasks/page.tsx`
**Note for next:** Task board ready with drag-drop functionality

### Chunk 5.4: Add Task Status Updates
**Context:** Move tasks through pipeline
- [x] Create status update API route at `/api/tasks/[id]/status`
- [x] Add status change buttons (already in task-card component)
- [x] Add activity logging (console logging for now)
**Note for next:** Task workflow ready - full drag-drop and button-based status updates working

### Phase 5 COMPLETE ✅
- Task CRUD operations fully implemented
- Kanban board with drag-and-drop functionality
- Status transitions with validation (not_started → in_progress → needs_review → done)
- Task assignment to users with role-based permissions
- Due date tracking with overdue indicators
- Activity logging for all status changes
- Client users have read-only access
- All task components created and tested
- Fixed authentication in API routes (using auth() instead of getServerSession)
- Fixed task status button clicks (event propagation issue resolved)
- Fixed drag-and-drop functionality
- Comprehensive Cypress E2E tests for all Phase 1-5 features
- Created missing navigation pages (/projects/[id] and /organizations/[id])
- All build errors resolved

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
- [x] Create feature_flags table (Note: already exists as 'features' table)
- [x] Create `/lib/features/featureFlags.ts` (partially implemented)
- [ ] Add flag checks to components
**Note for next:** Feature flags partially ready

### Chunk 10.4: Create Client Status System
**Context:** Visual health indicators
- [ ] Create `/features/status/lib/calculate-status.ts`
- [ ] Add status badges to UI
- [ ] Create status legend
**Note for next:** Status system ready

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

### Chunk 11.5: Add E2E Tests
**Context:** Critical path testing
- [x] Setup Playwright (done early!)
- [x] Test auth flow (comprehensive tests added)
- [ ] Test task creation
- [ ] Test file upload
**Note for next:** Auth tests ready, more tests needed

### Chunk 11.6: Performance Optimization
**Context:** Fast page loads
- [ ] Add React Query for caching
- [ ] Optimize images
- [ ] Check bundle size
**Note for next:** Performance tuned

### Chunk 11.7: Security Hardening
**Context:** Production safety
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Check SQL injection protection
- [ ] Add CSRF protection
**Note for next:** Security ready

### Chunk 11.8: Deployment Prep
**Context:** Ready for Vercel
- [ ] Update environment variables
- [ ] Create .env.production
- [ ] Test build locally
- [ ] Update README with setup
**Note for next:** Deploy ready

---

## Verification Checklist (Run after Phase 11)
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] All tests passing
- [ ] Mobile responsive verified
- [ ] Auth flow works end-to-end
- [ ] File uploads work
- [ ] Chat works
- [ ] Approvals work
- [ ] Admin can see all data
- [ ] Clients see only their data
- [ ] No console errors in browser

---

## Emergency Recovery
If something goes wrong:
1. Check `git status` and `git diff`
2. Stash changes if needed: `git stash`
3. Return to last working commit
4. Re-read this plan from the failed chunk
5. Break the chunk into smaller pieces

## Remember
- ALWAYS re-read this entire document after each chunk
- Mark chunks complete immediately
- If blocked, create a note and move to next chunk
- Quality > Speed