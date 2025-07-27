-- Files Table Migration
-- File management table with Supabase Storage integration and RLS policies
-- Based on current Neon schema: files table

-- Create file_type enum
CREATE TYPE public.file_type AS ENUM ('image', 'document', 'video', 'audio', 'archive', 'other');

-- Create storage_type enum (will migrate from local to supabase)
CREATE TYPE public.storage_type AS ENUM ('local', 'supabase', 's3');

-- Create files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  file_type public.file_type NOT NULL DEFAULT 'other',
  file_size BIGINT NOT NULL,
  storage_type public.storage_type NOT NULL DEFAULT 'supabase',
  file_path TEXT NOT NULL, -- Supabase Storage path
  s3_key VARCHAR(255), -- Legacy S3 support
  s3_bucket VARCHAR(255), -- Legacy S3 support
  s3_url TEXT, -- Legacy S3 support
  thumbnail_url TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Admins can view all files
CREATE POLICY "Admins can view all files" ON public.files
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can view files in tasks they have access to (basic access for now)
CREATE POLICY "Users can view task files" ON public.files
  FOR SELECT USING (
    task_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = files.task_id 
      AND (t.assigned_to_id = auth.uid() OR t.created_by_id = auth.uid())
    )
  );

-- Users can view files they uploaded
CREATE POLICY "Users can view uploaded files" ON public.files
  FOR SELECT USING (
    uploaded_by_id = auth.uid()
  );

-- Authenticated users can upload files (basic access, organization policies will be added later)
CREATE POLICY "Authenticated users can upload files" ON public.files
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (
      task_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = files.task_id 
        AND (t.assigned_to_id = auth.uid() OR t.created_by_id = auth.uid())
      )
    )
  );

-- Users can update files they uploaded, admins can update all
CREATE POLICY "Users can update relevant files" ON public.files
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    uploaded_by_id = auth.uid()
  );

-- Users can delete files they uploaded, admins can delete all
CREATE POLICY "Users can delete relevant files" ON public.files
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    uploaded_by_id = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX idx_files_project_id ON public.files(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_files_task_id ON public.files(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_files_uploaded_by_id ON public.files(uploaded_by_id) WHERE uploaded_by_id IS NOT NULL;
CREATE INDEX idx_files_file_type ON public.files(file_type);
CREATE INDEX idx_files_storage_type ON public.files(storage_type);
CREATE INDEX idx_files_created_at ON public.files(created_at);
CREATE INDEX idx_files_deleted_at ON public.files(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add updated_at trigger
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();