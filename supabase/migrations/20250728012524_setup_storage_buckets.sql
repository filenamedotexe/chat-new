-- Phase 5.1: Setup Supabase Storage Buckets
-- Create storage buckets for different file types with appropriate policies

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user-uploads', 'user-uploads', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'text/javascript', 'text/typescript', 'text/html', 'text/css']),
  ('project-files', 'project-files', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip']),
  ('conversation-attachments', 'conversation-attachments', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
ON CONFLICT (id) DO NOTHING;

-- Create basic storage policies for user-uploads bucket
-- Policy 1: Users can upload files to their own folder
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Users can read their own files (simplified for now)
CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 3: Users can update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 4: Users can delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create basic storage policies for project-files bucket
-- Policy 1: Authenticated users can upload project files (simplified for now)
CREATE POLICY "Users can upload project files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-files');

-- Policy 2: Authenticated users can read project files (simplified for now)
CREATE POLICY "Users can read project files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'project-files');

-- Policy 3: Authenticated users can update project files (simplified for now)
CREATE POLICY "Users can update project files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'project-files');

-- Policy 4: Authenticated users can delete project files (simplified for now)
CREATE POLICY "Users can delete project files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'project-files');

-- Create basic storage policies for conversation-attachments bucket
-- Policy 1: Authenticated users can upload conversation attachments
CREATE POLICY "Users can upload conversation attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'conversation-attachments');

-- Policy 2: Authenticated users can read conversation attachments (simplified for now)
CREATE POLICY "Users can read conversation attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'conversation-attachments');

-- Policy 3: Authenticated users can update conversation attachments
CREATE POLICY "Users can update conversation attachments" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'conversation-attachments');

-- Policy 4: Authenticated users can delete conversation attachments
CREATE POLICY "Users can delete conversation attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'conversation-attachments');

-- Note: RLS is already enabled on storage.objects table by default