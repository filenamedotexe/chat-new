-- Features Table Migration
-- Feature flags system with RLS policies
-- Based on current Neon schema: features table

-- Create features table (feature flags system)
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  enabled_for TEXT[], -- Array of user IDs or roles who have access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- All authenticated users can view features (read-only for feature checking)
CREATE POLICY "Authenticated users can view features" ON public.features
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can insert features
CREATE POLICY "Admins can insert features" ON public.features
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update features
CREATE POLICY "Admins can update features" ON public.features
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete features
CREATE POLICY "Admins can delete features" ON public.features
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE UNIQUE INDEX idx_features_name ON public.features(name);
CREATE INDEX idx_features_enabled ON public.features(enabled);
CREATE INDEX idx_features_created_at ON public.features(created_at);

-- Add updated_at trigger
CREATE TRIGGER update_features_updated_at
    BEFORE UPDATE ON public.features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();