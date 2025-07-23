'use client';

import { Layout, Header } from '@chat/ui';
import { Navigation } from './Navigation';
import type { UserRole } from '@chat/shared-types';

interface ProtectedLayoutClientProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  children: React.ReactNode;
}

export function ProtectedLayoutClient({ user, children }: ProtectedLayoutClientProps) {
  return (
    <Layout>
      <Header>
        <Navigation user={user} />
      </Header>
      {children}
    </Layout>
  );
}