'use client';

import { useAuth } from '@/lib/contexts/auth-context';

export function useSession() {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    user,
    isLoading: loading,
    isAuthenticated,
  };
}