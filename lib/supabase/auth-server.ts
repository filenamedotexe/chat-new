// Server-side Supabase Auth Helpers
// Handles SSR authentication with Supabase

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User, Session } from '@supabase/supabase-js';

// Create server client for SSR
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Get server session
export async function getServerSession(): Promise<Session | null> {
  const supabase = createServerSupabaseClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting server session:', error);
    return null;
  }
  
  return session;
}

// Get server user
export async function getServerUser(): Promise<User | null> {
  const supabase = createServerSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting server user:', error);
    return null;
  }
  
  return user;
}

// Get server user with role from our users table
export async function getServerUserWithRole() {
  const supabase = createServerSupabaseClient();
  
  // First get the auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { user: null, profile: null, error: authError };
  }
  
  // Then get the user profile with role from our users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { 
    user, 
    profile, 
    error: profileError 
  };
}

// Check if user is authenticated (for middleware/route protection)
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return !!session;
}

// Check if user has specific role
export async function hasRole(role: string): Promise<boolean> {
  const { profile } = await getServerUserWithRole();
  return profile?.role === role;
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

// Check if user is team member
export async function isTeamMember(): Promise<boolean> {
  const { profile } = await getServerUserWithRole();
  return profile?.role === 'admin' || profile?.role === 'team_member';
}

// Get user organizations (for access control)
export async function getUserOrganizations() {
  const { user } = await getServerUserWithRole();
  
  if (!user) {
    return [];
  }
  
  const supabase = createServerSupabaseClient();
  
  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      organizations (
        id,
        name,
        slug,
        type
      )
    `)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error getting user organizations:', error);
    return [];
  }
  
  return memberships?.map(m => m.organizations).filter(Boolean) || [];
}

// Check if user has access to organization
export async function hasOrganizationAccess(organizationId: string): Promise<boolean> {
  const { user } = await getServerUserWithRole();
  
  if (!user) {
    return false;
  }
  
  // Admins have access to all organizations
  if (await isAdmin()) {
    return true;
  }
  
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .single();
  
  return !error && !!data;
}

// Check if user has access to project
export async function hasProjectAccess(projectId: string): Promise<boolean> {
  const { user } = await getServerUserWithRole();
  
  if (!user) {
    return false;
  }
  
  // Admins have access to all projects
  if (await isAdmin()) {
    return true;
  }
  
  const supabase = createServerSupabaseClient();
  
  // Check if user has access to the project's organization
  const { data: project, error } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', projectId)
    .single();
  
  if (error || !project) {
    return false;
  }
  
  return hasOrganizationAccess(project.organization_id);
}