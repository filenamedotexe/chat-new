'use client';

import { Layout, Header, ErrorBoundary } from '@chat/ui';
import { Navigation } from './Navigation';
import { MobileMenuProvider } from '@/lib/contexts/mobile-menu-context';
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
    <MobileMenuProvider>
      <Layout>
        <Navigation user={user} />
        <Header>
          <Navigation.Header user={user} />
        </Header>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </Layout>
    </MobileMenuProvider>
  );
}