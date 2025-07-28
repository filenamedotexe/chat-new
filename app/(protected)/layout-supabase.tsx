import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/supabase/auth-server';
import { auth } from '@/lib/auth/auth.config';
import { ProtectedLayoutClient } from '@/components/ProtectedLayoutClient';
import { getFeature } from '@/packages/database/src';
import type { UserRole } from '@chat/shared-types';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if Supabase auth is enabled
  const supabaseAuthFeature = await getFeature('supabaseAuth');
  const useSupabaseAuth = supabaseAuthFeature?.enabled || false;
  
  if (useSupabaseAuth) {
    // Use Supabase Auth
    const user = await getServerUser();
    
    if (!user || !user.profile) {
      redirect('/login');
    }
    
    return (
      <ProtectedLayoutClient
        user={{
          id: user.profile.id,
          email: user.profile.email || '',
          name: user.profile.name || user.profile.email,
          role: user.profile.role as UserRole
        }}
      >
        {children}
      </ProtectedLayoutClient>
    );
  } else {
    // Use NextAuth (existing logic)
    const session = await auth();
    
    if (!session) {
      redirect('/login');
    }

    return (
      <ProtectedLayoutClient
        user={{
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name,
          role: session.user.role as UserRole
        }}
      >
        {children}
      </ProtectedLayoutClient>
    );
  }
}