# Supabase Migration Plan

**Project**: Chat-New Platform Migration from NextAuth.js + Neon to Full Supabase
**Timeline**: 4 weeks (28 days)
**Strategy**: Phased migration with zero downtime, extensive testing at each step

## Current State Overview

### Database (Neon PostgreSQL)
- **Location**: `packages/database/src/index.ts` - Raw SQL with neon serverless
- **Schema Files**: 
  - `packages/database/src/schema/auth.ts` - Drizzle schema for users/sessions/accounts
  - `packages/database/src/schema/organizations.ts`
  - `packages/database/src/schema/tasks.ts`
  - `packages/database/src/schema/files.ts`
  - `packages/database/src/schema/conversations.ts`
  - `packages/database/src/schema/activity.ts`
  - `packages/database/src/schema/communications.ts`
- **Mixed Approach**: Raw SQL queries + Drizzle ORM schemas
- **Key Tables**: users, sessions, features, organizations, projects, tasks, files, conversations, messages, activity_logs

### Authentication (NextAuth.js v5)
- **Config**: `lib/auth/auth.config.ts` - JWT strategy with DrizzleAdapter
- **Provider**: Credentials only (email/password)
- **Middleware**: `middleware.ts` + `lib/auth/middleware.ts` - Cookie-based redirects
- **Roles**: admin, client, team_member (stored in users.role)
- **Session Management**: JWT tokens with custom callbacks

### API Routes (25+ routes)
- **Pattern**: Manual auth checks using `auth()` from NextAuth
- **Authorization**: Role-based checks in each route
- **Examples**: 
  - `app/api/projects/route.ts` - CRUD with role restrictions
  - `app/api/files/route.ts` - File upload with permission checks
  - `app/api/tasks/route.ts` - Task management with org/project access

### File Storage
- **Location**: `public/uploads/{year}/{month}/` structure
- **Handler**: `features/files/lib/storage.ts` - Local filesystem
- **Upload Logic**: `app/api/files/route.ts` - FormData processing
- **Metadata**: Stored in database `files` table

### Key Dependencies to Replace
```json
{
  "next-auth": "5.x",
  "@auth/drizzle-adapter": "x.x",
  "@neondatabase/serverless": "x.x",
  "drizzle-orm": "x.x"
}
```

---

## Migration Phases

### PHASE 1: SETUP & PREPARATION (Days 1-3)

#### Chunk 1.1: Supabase Project Setup
**Time**: 2 hours
**Goal**: Create Supabase project and validate connection

**Steps**:
1. ✅ Supabase project already created
2. ✅ Credentials obtained:
   - Project URL: https://ixcsflqtipcfscbloahx.supabase.co
   - Project Ref: ixcsflqtipcfscbloahx
   - Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTExMzIsImV4cCI6MjA2OTIyNzEzMn0.HHdm2m1dWdFkBWkT_tr2v-cZS545SrC3mTkv-g2Ckzs
   - Service role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs
   - Database password: chat-new
3. Install Supabase CLI: `npm install -g @supabase/cli`
4. Login: `supabase login`
5. Init project: `supabase init`
6. Link project: `supabase link --project-ref ixcsflqtipcfscbloahx`

**Test**:
- [ ] Can access Supabase dashboard
- [ ] Can connect via CLI
- [ ] Database is accessible

**Files Modified**: None yet
**Notes**: Save all credentials in `.env.local` immediately

---

#### Chunk 1.2: Environment Setup
**Time**: 1 hour
**Goal**: Setup Supabase environment variables

**Steps**:
1. Create `.env.local` entries:
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ixcsflqtipcfscbloahx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTExMzIsImV4cCI6MjA2OTIyNzEzMn0.HHdm2m1dWdFkBWkT_tr2v-cZS545SrC3mTkv-g2Ckzs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs
SUPABASE_DB_PASSWORD=chat-new
```

2. Install Supabase dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

3. Create Supabase client setup:
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Test**:
- [ ] Environment variables load correctly
- [ ] Supabase client can be instantiated
- [ ] No build errors

**Files Created**:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

---

#### Chunk 1.3: Schema Export & Analysis
**Time**: 3 hours
**Goal**: Export current schema and plan Supabase equivalent

**Steps**:
1. Export current Neon schema:
```bash
# Connect to Neon and export
pg_dump $NEON_DATABASE_URL --schema-only > current_schema.sql
```

2. Create Supabase migration file:
```bash
supabase migration new initial_schema
```

3. Analyze current schema and create mapping document:
   - Document each table structure
   - Note foreign key relationships
   - Identify required RLS policies
   - Map current role checks to RLS

4. Create `schema_mapping.md` with:
   - Table-by-table migration plan
   - RLS policy requirements
   - Data migration considerations

**Test**:
- [ ] Current schema exported successfully
- [ ] All tables documented
- [ ] RLS requirements identified

**Files Created**:
- `current_schema.sql`
- `schema_mapping.md`
- `supabase/migrations/00000000000000_initial_schema.sql`

---

### PHASE 2: DATABASE MIGRATION (Days 4-7)

#### Chunk 2.1: Core Tables Migration
**Time**: 4 hours
**Goal**: Create core tables (users, sessions, features) in Supabase

**Steps**:
1. Create migration for core auth tables:
```sql
-- supabase/migrations/00000000000001_core_auth_tables.sql
-- Create users table (modify for Supabase Auth compatibility)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'team_member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

2. Run migration: `supabase db push`

3. Test in Supabase dashboard:
   - Verify tables created
   - Test RLS policies
   - Check indexes

**Test**:
- [ ] Tables created successfully
- [ ] RLS policies active
- [ ] Can query via Supabase dashboard

**Files Created**:
- `supabase/migrations/00000000000001_core_auth_tables.sql`

---

#### Chunk 2.2: Business Tables Migration
**Time**: 6 hours
**Goal**: Create organizations, projects, tasks, files tables

**Steps**:
1. Create migration for business tables:
```sql
-- supabase/migrations/00000000000002_business_tables.sql
-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table with RLS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies for each table
-- (detailed policies based on current role checks)
```

2. Create RLS policies matching current API logic:
   - Admin: full access
   - Team_member: organization-scoped access
   - Client: assigned projects only

**Test**:
- [ ] All business tables created
- [ ] RLS policies match current authorization logic
- [ ] Foreign keys working correctly

**Files Created**:
- `supabase/migrations/00000000000002_business_tables.sql`

---

#### Chunk 2.3: Data Migration Script
**Time**: 4 hours
**Goal**: Create script to migrate existing data

**Steps**:
1. Create data migration script:
```typescript
// scripts/migrate_data_to_supabase.ts
import { createClient } from '@supabase/supabase-js'
import { sql as neonSql } from '../packages/database/src/index'

async function migrateUsers() {
  const supabase = createClient(
    'https://ixcsflqtipcfscbloahx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs'
  )
  
  // Export from Neon
  const users = await neonSql`SELECT * FROM users`
  
  // Import to Supabase
  const { error } = await supabase
    .from('users')
    .insert(users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    })))
}
```

2. Test migration on small subset first
3. Validate data integrity after migration

**Test**:
- [ ] Data migration script works
- [ ] All records migrated successfully
- [ ] No data corruption
- [ ] Foreign key relationships maintained

**Files Created**:
- `scripts/migrate_data_to_supabase.ts`
- `scripts/validate_data_integrity.ts`

---

### PHASE 3: AUTH MIGRATION (Days 8-14)

#### Chunk 3.1: Supabase Auth Setup
**Time**: 3 hours
**Goal**: Configure Supabase Auth settings

**Steps**:
1. Configure Auth in Supabase dashboard:
   - Enable email auth
   - Disable email confirmation for now (enable later)
   - Set redirect URLs
   - Configure password requirements

2. Create auth helpers:
```typescript
// lib/supabase/auth.ts
import { createServerClient } from '@supabase/ssr'

export async function createServerSupabaseClient() {
  // Server-side auth client
}

export async function getSession() {
  // Get current session
}

export async function getUser() {
  // Get current user with role
}
```

**Test**:
- [ ] Auth configuration correct
- [ ] Can create test user in dashboard
- [ ] Auth helpers work correctly

**Files Created**:
- `lib/supabase/auth.ts`
- `lib/supabase/middleware.ts`

---

#### Chunk 3.2: Replace Login Form
**Time**: 4 hours
**Goal**: Replace NextAuth login with Supabase auth

**Steps**:
1. Update login form:
```typescript
// features/auth/components/login-form.tsx
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const supabase = createClient()
  
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      // Handle error
    } else {
      // Redirect to dashboard
      router.push('/dashboard')
    }
  }
}
```

2. Keep NextAuth login as fallback for now
3. Add feature flag to switch between auth systems

**Test**:
- [ ] Supabase login form works
- [ ] Can login existing users
- [ ] Redirects work correctly
- [ ] NextAuth still works as fallback

**Files Modified**:
- `features/auth/components/login-form.tsx`
- `app/(auth)/login/page.tsx`

---

#### Chunk 3.3: Replace Registration
**Time**: 3 hours
**Goal**: Update registration to use Supabase

**Steps**:
1. Update register form
2. Handle user role assignment
3. Test registration flow

**Test**:
- [ ] Registration creates Supabase user
- [ ] Role assignment works
- [ ] Email verification disabled for now

**Files Modified**:
- `features/auth/components/register-form.tsx`
- `app/api/auth/register/route.ts`

---

#### Chunk 3.4: Update Session Management
**Time**: 6 hours
**Goal**: Replace NextAuth session with Supabase

**Steps**:
1. Create session context:
```typescript
// lib/contexts/auth-context.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthContext {
  user: User | null
  session: Session | null
  loading: boolean
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Manage auth state with Supabase
}
```

2. Update all components using session
3. Replace `useSession` calls

**Test**:
- [ ] Session context works
- [ ] All components get correct auth state
- [ ] Session persists across page reloads

**Files Created**:
- `lib/contexts/auth-context.tsx`

**Files Modified**:
- `app/providers.tsx`
- All components using `useSession`

---

#### Chunk 3.5: Replace Middleware
**Time**: 4 hours
**Goal**: Update middleware to use Supabase auth

**Steps**:
1. Create new middleware:
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Apply same redirect logic as before
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  
  if (!user && !isAuthPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
```

**Test**:
- [ ] Middleware correctly identifies authenticated users
- [ ] Redirects work correctly
- [ ] Protected routes are protected
- [ ] Auth pages redirect when logged in

**Files Modified**:
- `middleware.ts`
- `lib/auth/middleware.ts` (remove)

---

### PHASE 4: API ROUTE MIGRATION (Days 15-21)

#### Chunk 4.1: Replace Simple CRUD Routes
**Time**: 8 hours
**Goal**: Replace basic CRUD API routes with Supabase client calls

**Priority Routes** (start with these):
1. `app/api/organizations/route.ts`
2. `app/api/projects/route.ts`
3. `app/api/tasks/route.ts`

**Steps**:
1. For each route, create client-side equivalent:
```typescript
// features/organizations/data/organizations.ts
import { createClient } from '@/lib/supabase/client'

export async function getOrganizations() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    
  if (error) throw error
  return data
}

export async function createOrganization(org: CreateOrganizationData) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .insert([org])
    .select()
    
  if (error) throw error
  return data[0]
}
```

2. Update React components to use direct Supabase calls
3. Test each route replacement individually
4. Keep old API routes as fallback during testing

**Test for each route**:
- [ ] GET requests work correctly
- [ ] POST requests work correctly
- [ ] RLS policies enforce correct permissions
- [ ] Error handling works
- [ ] Loading states work

**Files Created**:
- Direct client functions in each feature's data folder

**Files Modified**:
- All React components that call these APIs

---

#### Chunk 4.2: Replace Complex Routes
**Time**: 12 hours
**Goal**: Handle routes with complex business logic

**Complex Routes**:
1. `app/api/files/route.ts` - File upload
2. `app/api/conversations/route.ts` - Chat functionality
3. Routes with activity logging

**Strategy**: Move complex logic to Supabase Edge Functions

**Steps**:
1. Create Edge Functions for complex logic:
```typescript
// supabase/functions/handle-file-upload/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    'https://ixcsflqtipcfscbloahx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs'
  )
  
  // Handle file upload logic
  // Create activity log
  // Return response
})
```

2. Deploy Edge Functions: `supabase functions deploy`

3. Update frontend to call Edge Functions instead of API routes

**Test**:
- [ ] Edge Functions deploy successfully
- [ ] Complex logic works correctly
- [ ] Activity logging continues to work
- [ ] File uploads work with new system

**Files Created**:
- `supabase/functions/handle-file-upload/index.ts`
- `supabase/functions/create-project-with-activity/index.ts`
- Other Edge Functions as needed

---

### PHASE 5: FILE STORAGE MIGRATION (Days 22-24)

#### Chunk 5.1: Setup Supabase Storage
**Time**: 3 hours
**Goal**: Configure Supabase Storage buckets

**Steps**:
1. Create storage buckets in Supabase dashboard:
   - `project-files` bucket
   - `user-uploads` bucket
   - `conversation-attachments` bucket

2. Configure bucket policies:
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read files they have access to
CREATE POLICY "Users can read accessible files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'user-uploads' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE user_id = auth.uid() 
      AND project_id = (storage.foldername(name))[2]::uuid
    )
  ));
```

**Test**:
- [ ] Buckets created successfully
- [ ] Policies allow correct access
- [ ] Can upload test files via dashboard

**Files Modified**: None yet

---

#### Chunk 5.2: Create File Migration Script
**Time**: 4 hours
**Goal**: Migrate existing files to Supabase Storage

**Steps**:
1. Create migration script:
```typescript
// scripts/migrate_files_to_supabase.ts
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import { join } from 'path'

async function migrateFiles() {
  const supabase = createClient(
    'https://ixcsflqtipcfscbloahx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3NmbHF0aXBjZnNjYmxvYWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MTEzMiwiZXhwIjoyMDY5MjI3MTMyfQ.xbOSBM2L7HyCapEHRTvgUb9Ci6rG4CMrhqi6IOKXijs'
  )
  
  // Get all files from database
  const { data: files } = await supabase
    .from('files')
    .select('*')
  
  for (const file of files) {
    // Read file from local storage
    const localPath = join(process.cwd(), 'public', file.file_path)
    const fileBuffer = await readFile(localPath)
    
    // Upload to Supabase Storage
    const storagePath = `user-uploads/${file.uploaded_by_id}/${file.id}${getFileExtension(file.original_name)}`
    
    const { error } = await supabase.storage
      .from('user-uploads')
      .upload(storagePath, fileBuffer, {
        contentType: file.mime_type,
        upsert: true
      })
      
    if (error) {
      console.error(`Failed to migrate ${file.original_name}:`, error)
      continue
    }
    
    // Update database with new storage path
    await supabase
      .from('files')
      .update({ storage_path: storagePath })
      .eq('id', file.id)
  }
}
```

2. Test migration with subset of files first

**Test**:
- [ ] Files migrate successfully
- [ ] Database updated with new paths
- [ ] Files accessible via Supabase Storage URLs

**Files Created**:
- `scripts/migrate_files_to_supabase.ts`

---

#### Chunk 5.3: Update File Upload Logic
**Time**: 6 hours
**Goal**: Replace local file storage with Supabase Storage

**Steps**:
1. Update file upload component:
```typescript
// features/files/components/file-upload.tsx
import { createClient } from '@/lib/supabase/client'

export function FileUpload() {
  const supabase = createClient()
  
  const handleUpload = async (files: FileList) => {
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file)
        
      if (uploadError) {
        throw uploadError
      }
      
      // Create file record in database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          original_name: file.name,
          storage_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by_id: user.id,
          project_id: projectId,
          task_id: taskId
        })
        
      if (dbError) {
        throw dbError
      }
    }
  }
}
```

2. Update file download/view logic
3. Remove old storage helper functions

**Test**:
- [ ] File upload works with Supabase Storage
- [ ] Files are accessible after upload
- [ ] Database records created correctly
- [ ] File permissions work correctly

**Files Modified**:
- `features/files/components/file-upload.tsx`
- `features/files/lib/storage.ts` (remove functions)
- `app/api/files/route.ts` (simplify or remove)

---

### PHASE 6: REAL-TIME FEATURES (Days 25-26)

#### Chunk 6.1: Add Real-time to Chat
**Time**: 4 hours
**Goal**: Enable real-time updates in chat/conversations

**Steps**:
1. Update chat component with real-time subscriptions:
```typescript
// features/chat/components/chat-container.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ChatContainer({ conversationId }: { conversationId: string }) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  
  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(current => [...current, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])
}
```

2. Test real-time messaging
3. Add typing indicators if desired

**Test**:
- [ ] New messages appear immediately
- [ ] Multiple users can chat in real-time
- [ ] Real-time subscriptions clean up correctly

**Files Modified**:
- `features/chat/components/chat-container.tsx`
- Related chat components

---

#### Chunk 6.2: Add Real-time to Other Features
**Time**: 4 hours
**Goal**: Add real-time updates to tasks, activity logs

**Steps**:
1. Add real-time to task boards
2. Add real-time to activity timeline
3. Test performance with multiple subscriptions

**Test**:
- [ ] Task updates appear in real-time
- [ ] Activity logs update immediately
- [ ] No performance issues with multiple subscriptions

---

### PHASE 7: CLEANUP & FINALIZATION (Days 27-28)

#### Chunk 7.1: Remove NextAuth Dependencies
**Time**: 3 hours
**Goal**: Clean up all NextAuth code and dependencies

**Steps**:
1. Remove NextAuth dependencies:
```bash
npm uninstall next-auth @auth/drizzle-adapter
```

2. Delete NextAuth files:
   - `lib/auth/auth.config.ts`
   - `app/api/auth/[...nextauth]/route.ts`
   - `types/next-auth.d.ts`

3. Remove NextAuth imports from remaining files

**Test**:
- [ ] Build succeeds without NextAuth
- [ ] No broken imports
- [ ] All auth functionality works with Supabase

**Files Deleted**:
- All NextAuth-related files

---

#### Chunk 7.2: Remove Old API Routes
**Time**: 2 hours
**Goal**: Delete replaced API routes

**Steps**:
1. Delete API routes that are now handled by Supabase:
   - `app/api/organizations/route.ts`
   - `app/api/projects/route.ts`
   - `app/api/tasks/route.ts`
   - Others as appropriate

2. Keep only API routes that still serve a purpose
3. Update any remaining references

**Test**:
- [ ] No broken links to deleted routes
- [ ] Application works without deleted routes

---

#### Chunk 7.3: Remove Local File Storage
**Time**: 2 hours
**Goal**: Clean up local file storage code

**Steps**:
1. Remove file storage utilities:
   - `features/files/lib/storage.ts`

2. Delete uploaded files from `public/uploads/` (after confirming migration)

3. Update .gitignore to remove upload directories

**Test**:
- [ ] No references to old storage system
- [ ] Local files cleaned up safely

---

#### Chunk 7.4: Final Testing & Documentation
**Time**: 4 hours
**Goal**: Comprehensive testing and update documentation

**Steps**:
1. Run full Cypress test suite
2. Test all user journeys manually
3. Performance testing
4. Update README with new setup instructions
5. Document any breaking changes

**Test**:
- [ ] All Cypress tests pass
- [ ] Manual testing passes
- [ ] Performance is acceptable
- [ ] Documentation updated

---

## Migration Notes & Context

### Key Files to Remember
- **Main Database**: `packages/database/src/index.ts`
- **Auth Config**: `lib/auth/auth.config.ts`
- **Middleware**: `middleware.ts`
- **File Storage**: `features/files/lib/storage.ts`
- **API Routes**: `app/api/**/*.ts`

### Database Schema Notes
- Users table has custom role enum: 'admin', 'client', 'team_member'
- Organizations → Projects → Tasks hierarchy
- Files can be attached to projects or tasks
- Activity logs track all user actions
- Conversations and messages for chat feature

### Auth Flow Notes
- Currently uses credentials provider only
- JWT strategy with custom callbacks
- Role-based access control in each API route
- Simple cookie-based middleware

### Testing Strategy
- Cypress tests for UI functionality
- Manual testing for auth flows
- Database integrity checks after each migration
- Performance monitoring

### Rollback Strategy
For each phase, keep parallel systems running until tested:
1. Database: Sync writes to both Neon and Supabase
2. Auth: Feature flag to switch between NextAuth and Supabase
3. API: Keep old routes until new system proven
4. Files: Maintain local storage until migration confirmed

### Error Patterns to Watch
- RLS policy misconfigurations causing access denials
- Session cookie domain/path issues
- File upload size limits in Supabase
- Edge Function timeout issues
- Real-time subscription memory leaks

### Success Criteria
- [ ] Zero data loss during migration
- [ ] All existing functionality preserved
- [ ] New real-time features working
- [ ] Performance equal or better
- [ ] All tests passing
- [ ] Users can login/use app seamlessly

---

## Progress Tracking

### Completed Chunks
- [ ] Chunk 1.1: Supabase Project Setup
- [ ] Chunk 1.2: Environment Setup
- [ ] Chunk 1.3: Schema Export & Analysis
- [ ] Chunk 2.1: Core Tables Migration
- [ ] Chunk 2.2: Business Tables Migration
- [ ] Chunk 2.3: Data Migration Script
- [ ] Chunk 3.1: Supabase Auth Setup
- [ ] Chunk 3.2: Replace Login Form
- [ ] Chunk 3.3: Replace Registration
- [ ] Chunk 3.4: Update Session Management
- [ ] Chunk 3.5: Replace Middleware
- [ ] Chunk 4.1: Replace Simple CRUD Routes
- [ ] Chunk 4.2: Replace Complex Routes
- [ ] Chunk 5.1: Setup Supabase Storage
- [ ] Chunk 5.2: Create File Migration Script
- [ ] Chunk 5.3: Update File Upload Logic
- [ ] Chunk 6.1: Add Real-time to Chat
- [ ] Chunk 6.2: Add Real-time to Other Features
- [ ] Chunk 7.1: Remove NextAuth Dependencies
- [ ] Chunk 7.2: Remove Old API Routes
- [ ] Chunk 7.3: Remove Local File Storage
- [ ] Chunk 7.4: Final Testing & Documentation

### Current Chunk
**Not Started**

### Notes for Current Session
*To be updated during migration process*

### Issues Encountered
*To be documented as they arise*

### Performance Observations
*To be updated during testing*