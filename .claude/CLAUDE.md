# Claude Development Guide

This document contains everything you need to know about this codebase. All information is self-contained - no need to reference other docs.

## 🏗️ Project Overview

This is a **Next.js 14** project management application with real-time chat, file management, and team collaboration features.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Custom `@chat/ui` package
- **Testing**: Playwright
- **Type Safety**: TypeScript (strict mode)
- **Package Manager**: npm

### Key Features
- Role-based access control (Admin, Team Member, Client)
- Project and task management
- Real-time support chat system
- File upload and management
- Activity tracking and timeline
- Organization management
- Admin dashboard with analytics

## 🗂️ Complete Project Structure

```
chat-new/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth pages
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── (protected)/              # Authenticated pages
│   │   ├── admin/                # Admin-only pages
│   │   │   ├── activity/         # Activity logs
│   │   │   └── page.tsx          # Admin dashboard
│   │   ├── dashboard/            # Main dashboard
│   │   ├── files/                # File management
│   │   ├── organizations/        # Organization CRUD
│   │   ├── projects/             # Project management
│   │   ├── settings/             # User settings
│   │   ├── tasks/                # Task management
│   │   └── users/                # User file management
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin endpoints
│   │   ├── chat/                 # AI chat endpoint
│   │   ├── conversations/        # Support chat API
│   │   ├── files/                # File operations
│   │   ├── messages/             # Messaging API
│   │   ├── organizations/        # Org API
│   │   ├── projects/             # Project API
│   │   ├── tasks/                # Task API
│   │   └── users/                # User API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Shared components
│   ├── Navigation.tsx            # Main navigation
│   ├── ProtectedLayoutClient.tsx # Auth wrapper
│   └── chat/                     # Chat components
├── features/                     # Feature modules
│   ├── admin/                    # Admin features
│   ├── auth/                     # Auth components
│   ├── chat/                     # Chat implementation
│   ├── files/                    # File management
│   ├── messages/                 # Messaging system
│   ├── navigation/               # Nav components
│   ├── organizations/            # Org features
│   ├── progress/                 # Progress tracking
│   ├── projects/                 # Project features
│   ├── support-chat/             # Customer support chat
│   ├── tasks/                    # Task features
│   ├── timeline/                 # Activity timeline
│   └── users/                    # User features
├── lib/                          # Core utilities
│   ├── api/                      # API utilities
│   │   └── adapters/             # Auth adapters
│   ├── auth/                     # Auth helpers
│   │   ├── api-auth.ts           # API auth utils
│   │   ├── get-user.ts           # User helpers
│   │   └── middleware.ts         # Auth middleware
│   ├── contexts/                 # React contexts
│   │   └── auth-context.tsx      # Auth provider
│   ├── features/                 # Feature flags
│   ├── supabase/                 # Supabase setup
│   │   ├── auth-browser.ts       # Client auth
│   │   ├── auth-server.ts        # Server auth
│   │   ├── client.ts             # Browser client
│   │   ├── middleware.ts         # Session refresh
│   │   └── server.ts             # Server client
│   └── utils/                    # Utilities
├── packages/                     # Internal packages
│   ├── database/                 # DB schemas
│   ├── shared-types/             # TypeScript types
│   └── ui/                       # Component library
├── public/                       # Static assets
├── scripts/                      # Utility scripts
│   └── set-user-roles.ts         # Role management
├── tests/                        # Playwright tests
├── .claude/                      # Claude AI config
│   ├── agents/                   # AI agents
│   ├── commands/                 # Custom commands
│   ├── settings.json             # Settings
│   └── CLAUDE.md                 # This file
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js config
├── package.json                  # Dependencies
├── playwright.config.ts          # Test config
├── tailwind.config.js            # Tailwind config
└── tsconfig.json                 # TypeScript config
```

## 🔐 Authentication System (Supabase)

### How It Works

1. **Login Flow**:
   - User enters credentials at `/login`
   - `signInWithPassword()` calls Supabase Auth
   - Supabase sets secure httpOnly cookies
   - Middleware refreshes session automatically
   - User redirected to `/dashboard`

2. **Session Management**:
   - Every request goes through `/middleware.ts`
   - Uses `@supabase/ssr` for cookie management
   - Sessions auto-refresh before expiry
   - No manual token handling needed

3. **User Roles**:
   ```typescript
   type UserRole = 'admin' | 'team_member' | 'client';
   
   // Stored in user.user_metadata.role
   // Access levels:
   admin        → Full system access
   team_member  → Project/task management
   client       → View-only + support chat
   ```

### Test Users

```bash
# All passwords: password123
admin@test.com     # Admin access
team@test.com      # Team member access
client@test.com    # Client access
```

### Auth Code Patterns

**Client Component**:
```typescript
'use client';
import { useAuth } from '@/lib/contexts/auth-context';

export function MyComponent() {
  const { user, session, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Hello {user.email} ({user.user_metadata.role})</div>;
}
```

**Server Component**:
```typescript
import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // User is guaranteed here
  return <div>Welcome {user.email}</div>;
}
```

**API Route**:
```typescript
import { requireAuth, requireRole } from '@/lib/auth/api-auth';

// Basic auth check
export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error; // Returns 401
  
  return Response.json({ user });
}

// Role-based auth
export async function POST(request: Request) {
  const { user, error } = await requireRole(['admin', 'team_member']);
  if (error) return error; // Returns 401 or 403
  
  // Perform admin/team operation
  return Response.json({ success: true });
}
```

### Creating Supabase Clients

**Browser (Client Components)**:
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
// Use for: auth, realtime, client queries
```

**Server (Server Components/Routes)**:
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

const supabase = await createServerSupabaseClient();
// Use for: server-side queries, admin operations
```

## 🎭 Playwright Testing

### Setup & Run

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install chromium

# Run tests
npm run test:e2e          # Headless mode
npm run test:e2e:headed   # With browser
npm run test:e2e:ui       # Interactive UI
```

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should perform action', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('h1')).toContainText('Projects');
    
    // Test interactions
    await page.click('button:has-text("Create Project")');
    await page.fill('input[name="name"]', 'Test Project');
    await page.click('button[type="submit"]');
    
    // Verify results
    await expect(page.locator('text=Test Project')).toBeVisible();
  });
});
```

### Common Test Patterns

**Page Object Model**:
```typescript
// tests/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/dashboard');
  }
}

// Usage in test
const loginPage = new LoginPage(page);
await loginPage.login('admin@test.com', 'password123');
```

**Auth Fixture**:
```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Use authenticated page
    await use(page);
  },
});
```

### Debugging Tests

```bash
# Debug mode
npx playwright test --debug

# Slow motion
npx playwright test --slow-mo=1000

# Save traces
npx playwright test --trace on

# View traces
npx playwright show-trace trace.zip
```

## 🛠️ Development Workflow

### Starting Development

```bash
# 1. Clean start
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null
rm -rf .next

# 2. Start server
npm run dev

# 3. Verify running
curl http://localhost:3000
```

### Environment Variables

```bash
# .env.local (required)
NEXT_PUBLIC_SUPABASE_URL=https://ixcsflqtipcfscbloahx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Build & Deploy

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build

# Start production
npm start
```

## 📝 Code Patterns & Best Practices

### Server vs Client Components

**Server Component (default)**:
```typescript
// No 'use client' directive = Server Component
// ✅ Can fetch data directly
// ✅ Can use async/await at top level
// ✅ Better performance & SEO
// ❌ No hooks, state, or browser APIs

export default async function ProjectsPage() {
  const projects = await getProjects(); // Direct DB call
  
  return (
    <div>
      {projects.map(p => <ProjectCard key={p.id} project={p} />)}
    </div>
  );
}
```

**Client Component**:
```typescript
'use client'; // Required directive

// ✅ Can use hooks, state, effects
// ✅ Can handle interactions
// ✅ Access to browser APIs
// ❌ No direct async data fetching

export function InteractiveForm() {
  const [data, setData] = useState('');
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={data} onChange={e => setData(e.target.value)} />
    </form>
  );
}
```

### Data Fetching Patterns

**Server Component**:
```typescript
// Direct in component
async function Page() {
  const data = await supabase.from('projects').select();
  return <div>{/* render data */}</div>;
}
```

**Client Component**:
```typescript
// Using SWR or React Query
import useSWR from 'swr';

function Component() {
  const { data, error } = useSWR('/api/projects', fetcher);
  if (error) return <div>Error</div>;
  if (!data) return <div>Loading...</div>;
  return <div>{/* render data */}</div>;
}
```

### Error Handling

**Try-Catch Pattern**:
```typescript
try {
  const result = await riskyOperation();
  return Response.json({ data: result });
} catch (error) {
  console.error('Operation failed:', error);
  return Response.json(
    { error: 'Operation failed' },
    { status: 500 }
  );
}
```

**Error Boundaries**:
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Form Handling

**Server Actions (Recommended)**:
```typescript
// app/actions.ts
'use server';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  
  // Validate
  if (!name) {
    return { error: 'Name required' };
  }
  
  // Create
  const { data, error } = await supabase
    .from('projects')
    .insert({ name })
    .select()
    .single();
    
  if (error) return { error: error.message };
  
  revalidatePath('/projects');
  return { data };
}

// In component
<form action={createProject}>
  <input name="name" required />
  <button type="submit">Create</button>
</form>
```

### Type Safety

**Shared Types**:
```typescript
// packages/shared-types/src/index.ts
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

// Use everywhere
import type { Project } from '@chat/shared-types';
```

**API Response Types**:
```typescript
// Consistent API responses
type ApiResponse<T> = 
  | { data: T; error?: never }
  | { data?: never; error: string };

// Usage
export async function GET(): Promise<Response> {
  const response: ApiResponse<Project[]> = { data: projects };
  return Response.json(response);
}
```

## 🚨 Common Issues & Solutions

### Authentication Problems

**"Auth session missing!"**:
```bash
# Solution 1: Clear cookies
# In browser DevTools > Application > Cookies > Clear All

# Solution 2: Check middleware logs
# Look for [MIDDLEWARE] entries in console

# Solution 3: Verify env vars
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL); // Should not be undefined
```

**User role not working**:
```typescript
// Run role update script
npm run tsx scripts/set-user-roles.ts

// Or manually in Supabase dashboard
// Authentication > Users > Edit user > Raw JSON metadata
{
  "role": "admin",
  "name": "Admin User"
}
```

### Build Errors

**"Module not found"**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**:
```bash
# See all errors
npm run typecheck

# Common fixes:
# 1. Add missing types
# 2. Use 'as' for type assertions
# 3. Add // @ts-ignore for unfixable issues
```

### Database Issues

**"relation does not exist"**:
```sql
-- Check tables in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

**RLS (Row Level Security) errors**:
```sql
-- Disable RLS for development (Supabase dashboard)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

## 🔧 Utility Scripts

### Update User Roles
```bash
# scripts/set-user-roles.ts
npm run tsx scripts/set-user-roles.ts
```

### Clear Test Data
```sql
-- Run in Supabase SQL Editor
DELETE FROM messages WHERE created_at < NOW() - INTERVAL '7 days';
DELETE FROM files WHERE created_at < NOW() - INTERVAL '30 days';
```

## 📋 Pre-Commit Checklist

Before committing code:

- [ ] `npm run build` - Must pass
- [ ] `npm run typecheck` - No errors
- [ ] `npm run lint` - No errors
- [ ] Test auth flow manually
- [ ] No console.log() in production code
- [ ] No hardcoded secrets
- [ ] Update types if APIs changed
- [ ] Add to changelog if significant

## 🎯 Quick Command Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production

# Code Quality  
npm run typecheck              # TypeScript check
npm run lint                   # ESLint
npm run lint:fix               # Fix lint issues

# Testing
npm run test:e2e               # Run all tests
npm run test:e2e:headed        # With browser
npm run test:e2e:ui            # Interactive mode

# Database
npm run db:generate            # Generate types
npm run db:push                # Push schema

# Utilities
npm run tsx <script>           # Run TypeScript files
```

## 💡 Pro Tips

1. **Always use Server Components by default** - Only add 'use client' when needed
2. **Prefetch data in layouts** - Pass to pages as props
3. **Use Suspense boundaries** - Better loading states
4. **Cache API responses** - Use Next.js caching
5. **Validate early** - Use zod schemas
6. **Log errors properly** - Include context
7. **Test edge cases** - Empty states, errors, loading
8. **Use TypeScript strictly** - Avoid 'any' type
9. **Component composition** - Small, focused components
10. **Performance first** - Measure with Lighthouse

Remember: This is a production application. Write clean, tested, type-safe code.