import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { ProtectedLayoutClient } from '@/components/ProtectedLayoutClient';
import type { UserRole } from '@chat/shared-types';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always use Supabase Auth
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <ProtectedLayoutClient
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole
      }}
    >
      {children}
    </ProtectedLayoutClient>
  );
}