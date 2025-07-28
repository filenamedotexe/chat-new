import { auth } from '@/lib/auth/auth.config';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getFeature } from '@/packages/database/src';
import type { UserRole } from '@chat/shared-types';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    // Check if Supabase auth is enabled
    const supabaseAuthFeature = await getFeature('supabaseAuth');
    const useSupabaseAuth = supabaseAuthFeature?.enabled || false;

    if (useSupabaseAuth) {
      // Use Supabase auth
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return {
        user: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email || '',
          role: (user.user_metadata?.role as UserRole) || 'client',
        },
      };
    } else {
      // Use NextAuth
      const session = await auth();
      
      if (!session) {
        return null;
      }

      return {
        user: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name || '',
          role: session.user.role as UserRole,
        },
      };
    }
  } catch (error) {
    console.error('Auth adapter error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthSession> {
  const session = await requireAuth();
  
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }
  
  return session;
}