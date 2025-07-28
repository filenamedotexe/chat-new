import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { ProtectedLayoutClient } from '@/components/ProtectedLayoutClient';
import type { UserRole } from '@chat/shared-types';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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