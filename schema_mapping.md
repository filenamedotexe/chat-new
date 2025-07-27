# Schema Mapping: Neon → Supabase Migration

**Generated**: 2025-07-27  
**Source**: Neon PostgreSQL Database  
**Target**: Supabase PostgreSQL with RLS  

## Current Schema Overview

**Total Tables**: 11  
**Key Relationships**: Organizations → Projects → Tasks hierarchy  
**Authentication**: NextAuth.js v5 with sessions table  
**File Storage**: Local filesystem with metadata in files table  

---

## Table-by-Table Migration Plan

### 1. **users** (Core Authentication Table)
**Current Schema**:
```sql
- id: uuid (PRIMARY KEY)
- email: varchar(255) UNIQUE NOT NULL  
- name: varchar(255)
- password_hash: varchar(255) NOT NULL
- role: varchar(50) DEFAULT 'user' (admin, client, team_member)
- created_at, updated_at: timestamptz
- email_verified: timestamptz
- image: text
```

**Supabase Migration**:
- ✅ **Compatible with Supabase Auth**
- ⚠️ **Change Required**: Remove `password_hash` - Supabase handles this
- ✅ **RLS Required**: Users can only access their own data

**RLS Policies Needed**:
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

### 2. **sessions** (NextAuth Sessions)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- user_id: uuid → users(id)
- session_token: varchar(255) UNIQUE
- expires: timestamptz
- created_at: timestamptz
```

**Supabase Migration**:
- ❌ **Remove Entirely**: Supabase Auth handles sessions
- 🔄 **Migration Strategy**: Export active sessions for user transition

---

### 3. **organizations** (Multi-tenant Structure)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- name: text NOT NULL
- slug: text UNIQUE NOT NULL
- type: organization_type DEFAULT 'client'
- description, logo, website, contact_email, contact_phone, address: text
- created_at, updated_at: timestamptz
```

**RLS Policies Needed**:
```sql
-- Admin: Full access
CREATE POLICY "Admins manage organizations" ON organizations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Team members: Can view organizations they're members of
CREATE POLICY "Team members view member organizations" ON organizations  
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om 
      WHERE om.organization_id = id AND om.user_id = auth.uid()
    )
  );

-- Clients: Can only view their own organization
CREATE POLICY "Clients view own organization" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN organization_members om ON u.id = om.user_id
      WHERE u.id = auth.uid() AND u.role = 'client' AND om.organization_id = id
    )
  );
```

---

### 4. **organization_members** (Junction Table)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- organization_id: uuid → organizations(id)  
- user_id: uuid → users(id)
- created_at: timestamptz
```

**RLS Policies Needed**:
```sql
-- Members can view their own memberships
CREATE POLICY "Users view own memberships" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Admins manage all memberships
CREATE POLICY "Admins manage memberships" ON organization_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

### 5. **projects** (Project Management)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- organization_id: uuid → organizations(id)
- name: text NOT NULL
- slug: text NOT NULL  
- description: text
- status: text DEFAULT 'active'
- start_date, end_date: timestamptz
- created_at, updated_at: timestamptz
```

**RLS Policies Needed**:
```sql
-- Admin: Full access to all projects
CREATE POLICY "Admins manage all projects" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Team members: Access to projects in their organizations
CREATE POLICY "Team members access org projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = projects.organization_id 
      AND om.user_id = auth.uid()
    )
  );

-- Clients: Only projects in their organization
CREATE POLICY "Clients access own org projects" ON projects  
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN organization_members om ON u.id = om.user_id
      WHERE u.id = auth.uid() AND u.role = 'client' 
      AND om.organization_id = projects.organization_id
    )
  );
```

---

### 6. **tasks** (Task Management)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- project_id: uuid → projects(id)
- title: text NOT NULL
- description: text
- status: task_status DEFAULT 'not_started'
- assigned_to_id: uuid → users(id)
- created_by_id: uuid → users(id)  
- due_date, completed_at: timestamptz
- created_at, updated_at: timestamptz
```

**RLS Policies Needed**:
```sql
-- Users can view tasks in projects they have access to
CREATE POLICY "Users view accessible tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON p.organization_id = om.organization_id
      WHERE p.id = tasks.project_id AND om.user_id = auth.uid()
    )
  );

-- Users can only update tasks assigned to them or created by them
CREATE POLICY "Users update own tasks" ON tasks
  FOR UPDATE USING (
    assigned_to_id = auth.uid() OR created_by_id = auth.uid()
  );
```

---

### 7. **files** (File Management → Supabase Storage)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- original_name: varchar(255)
- file_name: varchar(255) 
- mime_type: varchar(255)
- file_type: file_type DEFAULT 'other'
- file_size: bigint
- storage_type: storage_type DEFAULT 'local'
- file_path: text (local path)
- s3_key, s3_bucket, s3_url: varchar/text (unused)
- project_id: uuid → projects(id)
- task_id: uuid → tasks(id)
- uploaded_by_id: uuid → users(id)
- created_at, updated_at, deleted_at: timestamptz
```

**Supabase Migration**:
- 🔄 **Major Change**: Migrate from local storage to Supabase Storage
- ✅ **Keep Metadata**: Preserve file records for references
- 🔄 **Update Storage Path**: Change `file_path` to Supabase Storage path

**RLS Policies Needed**:
```sql
-- Users can view files in projects they have access to
CREATE POLICY "Users view accessible files" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON p.organization_id = om.organization_id  
      WHERE p.id = files.project_id AND om.user_id = auth.uid()
    ) OR uploaded_by_id = auth.uid()
  );
```

**Storage Bucket Policies**:
```sql
-- Users can upload to their own folder
CREATE POLICY "Users upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### 8. **messages** (Communication)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- content: text NOT NULL
- type: varchar(50) DEFAULT 'text'
- sender_id: uuid → users(id)
- project_id: uuid → projects(id) 
- task_id: uuid → tasks(id)
- recipient_id: uuid → users(id)
- conversation_id: uuid → conversations(id)
- parent_message_id: uuid → messages(id)
- is_edited: boolean DEFAULT false
- is_internal_note: boolean DEFAULT false
- read_at: timestamp
- deleted_at, created_at, updated_at: timestamptz
```

**Real-time Features**:
- ✅ **Perfect for Supabase Real-time**: Instant message updates
- 🔄 **Broadcast Changes**: New messages trigger real-time updates

**RLS Policies Needed**:
```sql
-- Users can view messages in conversations they're part of
CREATE POLICY "Users view conversation messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.client_id = auth.uid() OR c.assigned_to = auth.uid())
    )
  );
```

---

### 9. **conversations** (Support Chat)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- client_id: uuid → users(id)
- status: conversation_status DEFAULT 'active'
- assigned_to: uuid → users(id)
- priority: conversation_priority DEFAULT 'normal'  
- last_message_at: timestamp DEFAULT now()
- created_at, updated_at: timestamp
```

**Real-time Features**:
- ✅ **Real-time Status Updates**: Active/inactive conversations
- ✅ **Typing Indicators**: Show when users are typing

---

### 10. **activity_logs** (Audit Trail)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY
- user_id: uuid → users(id)
- user_role: text
- user_name: text
- action: text (PROJECT_CREATED, TASK_UPDATED, etc.)
- entity_type: text  
- entity_id: uuid
- entity_name: text
- project_id, task_id, organization_id: uuid (optional)
- old_values, new_values, metadata: jsonb
- created_at: timestamptz
```

**RLS Policies Needed**:
```sql  
-- Users can view activity logs for projects they have access to
CREATE POLICY "Users view accessible activity" ON activity_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON p.organization_id = om.organization_id
      WHERE p.id = activity_logs.project_id AND om.user_id = auth.uid()
    )
  );
```

---

### 11. **features** (Feature Flags)
**Current Schema**:
```sql
- id: uuid PRIMARY KEY  
- name: varchar(255) UNIQUE
- description: text
- enabled: boolean DEFAULT false
- enabled_for: text[] (user IDs)
- created_at, updated_at: timestamptz
```

**RLS Policies Needed**:
```sql
-- All authenticated users can read feature flags
CREATE POLICY "All users read features" ON features
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage feature flags  
CREATE POLICY "Admins manage features" ON features
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## Migration Priorities

### Phase 1: Core Auth & Organization Structure
1. **users** (modify for Supabase Auth)
2. **organizations** 
3. **organization_members**

### Phase 2: Project Management  
4. **projects**
5. **tasks**
6. **features**

### Phase 3: Communication & Files
7. **conversations** 
8. **messages** (with real-time)
9. **files** (migrate to Supabase Storage)
10. **activity_logs**

### Phase 4: Cleanup
11. Remove **sessions** table

---

## Key Supabase Features to Leverage

### Real-time Subscriptions
- **messages**: Instant chat updates
- **tasks**: Live task board updates  
- **activity_logs**: Real-time activity feed

### Storage Integration
- **files**: Move from local storage to Supabase Storage
- **organizations.logo**: Store in Supabase Storage
- **users.image**: Profile pictures in Supabase Storage

### Auth Integration
- **Remove sessions table**: Use Supabase Auth
- **RLS policies**: Replace API-level auth checks
- **JWT claims**: Add custom role claims

---

## Data Migration Considerations

### User Authentication
- **Export user emails**: For Supabase Auth user creation
- **Preserve user roles**: Add to auth metadata
- **Session transition**: Graceful logout/login flow

### File Migration  
- **Preserve file paths**: Update to Supabase Storage URLs
- **Batch migration**: Process files in chunks
- **Integrity checks**: Verify all files migrated successfully

### Foreign Key Relationships
- **Preserve all UUIDs**: No ID changes needed
- **Cascade deletes**: Maintain referential integrity
- **Index recreation**: Optimize for Supabase queries

---

## Success Criteria
- [ ] All 11 tables migrated with RLS policies
- [ ] Real-time features working (messages, tasks)  
- [ ] File storage migrated to Supabase Storage
- [ ] All foreign key relationships preserved
- [ ] Zero data loss during migration
- [ ] Authentication seamlessly transitioned