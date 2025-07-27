-- Organization Members Table Migration
-- Junction table linking users to organizations with RLS policies
-- Based on current Neon schema: organization_members table

-- Create organization_members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique user-organization pairs
  UNIQUE(organization_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Admins can view all organization memberships
CREATE POLICY "Admins can view all memberships" ON public.organization_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can view memberships for organizations they belong to
CREATE POLICY "Users can view org memberships" ON public.organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om2
      WHERE om2.organization_id = organization_members.organization_id 
      AND om2.user_id = auth.uid()
    )
  );

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships" ON public.organization_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Only admins can insert memberships
CREATE POLICY "Admins can insert memberships" ON public.organization_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update memberships
CREATE POLICY "Admins can update memberships" ON public.organization_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete memberships
CREATE POLICY "Admins can delete memberships" ON public.organization_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_organization_members_created_at ON public.organization_members(created_at);

-- Create unique constraint index
CREATE UNIQUE INDEX idx_organization_members_unique ON public.organization_members(organization_id, user_id);