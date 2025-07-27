-- Current Neon Database Schema Export
-- Generated: 2025-07-27T22:03:28.078Z
-- Database: ep-young-snow-aexyf00t-pooler.c-2.us-east-2.aws.neon.tech


-- Table: activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_role text NOT NULL,
  user_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  entity_name text,
  project_id uuid,
  task_id uuid,
  organization_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for activity_logs
CREATE INDEX activity_logs_user_id_idx ON public.activity_logs USING btree (user_id);
CREATE INDEX activity_logs_entity_idx ON public.activity_logs USING btree (entity_type, entity_id);
CREATE INDEX activity_logs_project_id_idx ON public.activity_logs USING btree (project_id);
CREATE INDEX activity_logs_created_at_idx ON public.activity_logs USING btree (created_at);
CREATE INDEX activity_logs_action_idx ON public.activity_logs USING btree (action);

-- Table: conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  status USER-DEFINED DEFAULT 'active'::public.conversation_status,
  assigned_to uuid,
  priority USER-DEFINED DEFAULT 'normal'::public.conversation_priority,
  last_message_at timestamp without time zone DEFAULT now(),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Indexes for conversations
CREATE INDEX idx_conversations_client_id ON public.conversations USING btree (client_id);
CREATE INDEX idx_conversations_assigned_to ON public.conversations USING btree (assigned_to);
CREATE INDEX idx_conversations_status ON public.conversations USING btree (status);

-- Table: features
CREATE TABLE IF NOT EXISTS public.features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(255) NOT NULL,
  description text,
  enabled boolean DEFAULT false,
  enabled_for ARRAY,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for features
CREATE UNIQUE INDEX features_name_key ON public.features USING btree (name);

-- Table: files
CREATE TABLE IF NOT EXISTS public.files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  original_name character varying(255) NOT NULL,
  file_name character varying(255) NOT NULL,
  mime_type character varying(255) NOT NULL,
  file_type USER-DEFINED NOT NULL DEFAULT 'other'::public.file_type,
  file_size bigint NOT NULL,
  storage_type USER-DEFINED NOT NULL DEFAULT 'local'::public.storage_type,
  file_path text NOT NULL,
  s3_key character varying(255),
  s3_bucket character varying(255),
  s3_url text,
  thumbnail_url text,
  project_id uuid,
  task_id uuid,
  uploaded_by_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Indexes for files
CREATE INDEX idx_files_project_id ON public.files USING btree (project_id);
CREATE INDEX idx_files_task_id ON public.files USING btree (task_id);
CREATE INDEX idx_files_uploaded_by_id ON public.files USING btree (uploaded_by_id);
CREATE INDEX idx_files_created_at ON public.files USING btree (created_at DESC);
CREATE INDEX idx_files_deleted_at ON public.files USING btree (deleted_at);
CREATE INDEX idx_files_file_type ON public.files USING btree (file_type);

-- Table: messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content text NOT NULL,
  type character varying(50) DEFAULT 'text'::character varying,
  sender_id uuid NOT NULL,
  project_id uuid,
  task_id uuid,
  recipient_id uuid,
  parent_message_id uuid,
  is_edited boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  conversation_id uuid,
  is_internal_note boolean DEFAULT false,
  read_at timestamp without time zone
);

-- Indexes for messages
CREATE INDEX idx_messages_project_id ON public.messages USING btree (project_id) WHERE (project_id IS NOT NULL);
CREATE INDEX idx_messages_task_id ON public.messages USING btree (task_id) WHERE (task_id IS NOT NULL);
CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages USING btree (recipient_id) WHERE (recipient_id IS NOT NULL);
CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);
CREATE INDEX idx_messages_deleted_at ON public.messages USING btree (deleted_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);
CREATE INDEX idx_messages_read_at ON public.messages USING btree (read_at);

-- Table: organization_members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for organization_members

-- Table: organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'client'::public.organization_type,
  description text,
  logo text,
  website text,
  contact_email text,
  contact_phone text,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for organizations
CREATE UNIQUE INDEX organizations_slug_key ON public.organizations USING btree (slug);

-- Table: projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active'::text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for projects

-- Table: sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token character varying(255) NOT NULL,
  expires timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for sessions
CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);
CREATE INDEX idx_sessions_token ON public.sessions USING btree (session_token);
CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);

-- Table: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status USER-DEFINED NOT NULL DEFAULT 'not_started'::public.task_status,
  assigned_to_id uuid,
  created_by_id uuid NOT NULL,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tasks

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying(255) NOT NULL,
  name character varying(255),
  password_hash character varying(255) NOT NULL,
  role character varying(50) NOT NULL DEFAULT 'user'::character varying,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  email_verified timestamp with time zone,
  image text
);

-- Indexes for users
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE INDEX idx_users_email ON public.users USING btree (email);

-- Foreign Key Constraints
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);
ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_uploaded_by_id_fkey FOREIGN KEY (uploaded_by_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.messages(id);
ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);
ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_messages_conversation_id FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);
