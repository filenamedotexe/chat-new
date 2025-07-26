'use client';

import { Layout, Header, ErrorBoundary, Breadcrumbs, MobileBreadcrumbs } from '@chat/ui';
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
        {/* Breadcrumbs below header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-2">
            {/* Desktop breadcrumbs */}
            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
            {/* Mobile breadcrumbs */}
            <div className="md:hidden">
              <MobileBreadcrumbs />
            </div>
          </div>
        </div>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </Layout>
    </MobileMenuProvider>
  );
}