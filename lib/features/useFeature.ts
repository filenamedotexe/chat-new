'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
// Feature types now handled inline

export function useFeature(featureName: string): boolean {
  const { session, loading: authLoading } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFeature() {
      try {
        const response = await fetch(`/api/features/${featureName}`);
        const data = await response.json();
        setIsEnabled(data.enabled);
      } catch (error) {
        console.error('Error checking feature flag:', error);
        setIsEnabled(false);
      } finally {
        setLoading(false);
      }
    }

    if (authLoading) {
      return;
    }

    if (session) {
      checkFeature();
    } else {
      setLoading(false);
    }
  }, [featureName, session, authLoading]);

  return !loading && isEnabled;
}