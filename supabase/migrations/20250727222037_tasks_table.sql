-- Tasks Table Migration
-- Task management table with project relationship and complex RLS policies
-- Based on current Neon schema: tasks table

-- Create task_status enum
CREATE TYPE public.task_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked', 'cancelled');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'not_started',
  assigned_to_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Admins can view all tasks
CREATE POLICY "Admins can view all tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Note: Team member organization policies will be added after organization_members table is created

-- Users can view tasks assigned to them
CREATE POLICY "Users can view assigned tasks" ON public.tasks
  FOR SELECT USING (
    assigned_to_id = auth.uid()
  );

-- Users can view tasks they created
CREATE POLICY "Users can view created tasks" ON public.tasks
  FOR SELECT USING (
    created_by_id = auth.uid()
  );

-- Only admins can insert tasks initially (organization policies will be added later)
CREATE POLICY "Admins can insert tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can update tasks they created or are assigned to, admins can update all
CREATE POLICY "Users can update relevant tasks" ON public.tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    assigned_to_id = auth.uid()
    OR
    created_by_id = auth.uid()
  );

-- Only admins and task creators can delete tasks
CREATE POLICY "Admins and creators can delete tasks" ON public.tasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    created_by_id = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to_id ON public.tasks(assigned_to_id);
CREATE INDEX idx_tasks_created_by_id ON public.tasks(created_by_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);

-- Add updated_at trigger
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();