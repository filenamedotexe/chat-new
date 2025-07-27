-- Organizations Table Migration
-- Core business entity table with RLS policies
-- Based on current Neon schema: organizations table

-- Create organization_type enum
CREATE TYPE public.organization_type AS ENUM ('client', 'agency', 'partner');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type public.organization_type NOT NULL DEFAULT 'client',
  description TEXT,
  logo TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Admins can view all organizations
CREATE POLICY "Admins can view all organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Note: Team member and client policies will be added after organization_members table is created

-- Only admins can insert organizations
CREATE POLICY "Admins can insert organizations" ON public.organizations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update organizations (team member policy will be added later)
CREATE POLICY "Admins can update organizations" ON public.organizations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete organizations
CREATE POLICY "Admins can delete organizations" ON public.organizations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE UNIQUE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_type ON public.organizations(type);
CREATE INDEX idx_organizations_created_at ON public.organizations(created_at);

-- Add updated_at trigger
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();