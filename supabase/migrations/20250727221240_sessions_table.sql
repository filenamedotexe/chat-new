-- Sessions Table Migration  
-- NextAuth.js compatible sessions table with RLS policies
-- Based on current Neon schema: sessions table

-- Create sessions table (NextAuth.js compatible)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND id = auth.uid())
  );

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND id = auth.uid())
  );

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND id = auth.uid())
  );

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON public.sessions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND id = auth.uid())
  );

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON public.sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE UNIQUE INDEX idx_sessions_session_token ON public.sessions(session_token);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_expires ON public.sessions(expires);