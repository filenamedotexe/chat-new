'use client';

import { Navigation } from './Navigation';
import type { UserRole } from '@chat/shared-types';

interface ClientNavigationProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
}

export function ClientNavigation({ user }: ClientNavigationProps) {
  return <Navigation user={user} />;
}