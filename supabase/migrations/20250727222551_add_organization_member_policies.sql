-- Add Organization Member Dependent Policies
-- This migration adds policies that depend on organization_members table
-- These policies were deferred from earlier migrations due to table dependencies

-- Organizations table - Add team member and client policies
CREATE POLICY "Team members can view their organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id 
      WHERE om.organization_id = organizations.id 
      AND u.id = auth.uid() 
      AND u.role IN ('team_member', 'admin')
    )
  );

CREATE POLICY "Clients can view their organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id 
      WHERE om.organization_id = organizations.id 
      AND u.id = auth.uid()
    )
  );

-- Update organizations update policy to include team members
DROP POLICY "Admins can update organizations" ON public.organizations;
CREATE POLICY "Admins and team members can update organizations" ON public.organizations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id 
      WHERE om.organization_id = organizations.id 
      AND u.id = auth.uid() 
      AND u.role = 'team_member'
    )
  );

-- Projects table - Add team member and client policies
CREATE POLICY "Team members can view org projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id 
      WHERE om.organization_id = projects.organization_id 
      AND u.id = auth.uid() 
      AND u.role IN ('team_member', 'admin')
    )
  );

CREATE POLICY "Clients can view assigned projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id 
      WHERE om.organization_id = projects.organization_id 
      AND u.id = auth.uid()
    )
  );

-- Update projects insert/update policies to include team members
DROP POLICY "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins and team members can insert projects" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id 
      WHERE om.organization_id = projects.organization_id 
      AND u.id = auth.uid() 
      AND u.role = 'team_member'
    )
  );

DROP POLICY "Admins can update projects" ON public.projects;
CREATE POLICY "Admins and team members can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id 
      WHERE om.organization_id = projects.organization_id 
      AND u.id = auth.uid() 
      AND u.role = 'team_member'
    )
  );

-- Tasks table - Add team member and client policies
CREATE POLICY "Team members can view org tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.projects p ON p.organization_id = om.organization_id
      JOIN public.users u ON u.id = om.user_id 
      WHERE p.id = tasks.project_id 
      AND u.id = auth.uid() 
      AND u.role IN ('team_member', 'admin')
    )
  );

CREATE POLICY "Clients can view project tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.projects p ON p.organization_id = om.organization_id
      JOIN public.users u ON u.id = om.user_id 
      WHERE p.id = tasks.project_id 
      AND u.id = auth.uid()
    )
  );

-- Update tasks insert policy to include team members
DROP POLICY "Admins can insert tasks" ON public.tasks;
CREATE POLICY "Admins and team members can insert tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.projects p ON p.organization_id = om.organization_id
      JOIN public.users u ON u.id = om.user_id 
      WHERE p.id = tasks.project_id 
      AND u.id = auth.uid() 
      AND u.role = 'team_member'
    )
  );

-- Update tasks update policy to include team members
DROP POLICY "Users can update relevant tasks" ON public.tasks;
CREATE POLICY "Users can update relevant tasks" ON public.tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    assigned_to_id = auth.uid()
    OR
    created_by_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.projects p ON p.organization_id = om.organization_id
      JOIN public.users u ON u.id = om.user_id 
      WHERE p.id = tasks.project_id 
      AND u.id = auth.uid() 
      AND u.role = 'team_member'
    )
  );

-- Files table - Add organization-based policies
CREATE POLICY "Users can view project files" ON public.files
  FOR SELECT USING (
    project_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.projects p ON p.organization_id = om.organization_id
      JOIN public.users u ON u.id = om.user_id 
      WHERE p.id = files.project_id 
      AND u.id = auth.uid()
    )
  );

-- Update files insert policy to include organization access
DROP POLICY "Authenticated users can upload files" ON public.files;
CREATE POLICY "Authenticated users can upload files" ON public.files
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    (
      project_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.organization_members om
        JOIN public.projects p ON p.organization_id = om.organization_id
        JOIN public.users u ON u.id = om.user_id 
        WHERE p.id = files.project_id 
        AND u.id = auth.uid()
      )
    ) AND
    (
      task_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.tasks t
        JOIN public.projects p ON p.id = t.project_id
        JOIN public.organization_members om ON om.organization_id = p.organization_id
        JOIN public.users u ON u.id = om.user_id 
        WHERE t.id = files.task_id 
        AND u.id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.tasks t
        WHERE t.id = files.task_id 
        AND (t.assigned_to_id = auth.uid() OR t.created_by_id = auth.uid())
      )
    )
  );