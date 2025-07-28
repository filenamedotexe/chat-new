import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { 
      user: null, 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    };
  }
  
  // Get user role from metadata or database
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  const role = profile?.role || user.user_metadata?.role || 'client';
  
  return {
    user: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email!.split('@')[0],
      role: role as 'admin' | 'team_member' | 'client'
    },
    error: null
  };
}

// Export authMiddleware as an alias for requireAuth for backward compatibility
export const authMiddleware = requireAuth;

export async function requireRole(requiredRole: 'admin' | 'team_member' | 'client') {
  const { user, error } = await requireAuth();
  
  if (error) return { user: null, error };
  
  // Check role hierarchy
  const hasAccess = (() => {
    switch (requiredRole) {
      case 'admin':
        return user!.role === 'admin';
      case 'team_member':
        return user!.role === 'admin' || user!.role === 'team_member';
      case 'client':
        return true; // All authenticated users have client access
      default:
        return false;
    }
  })();
  
  if (!hasAccess) {
    return { 
      user: null, 
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) 
    };
  }
  
  return { user, error: null };
}