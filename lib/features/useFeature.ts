'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { FeatureName } from './featureFlags';

export function useFeature(featureName: FeatureName): boolean {
  const { data: session } = useSession();
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

    if (session) {
      checkFeature();
    } else {
      setLoading(false);
    }
  }, [featureName, session]);

  return !loading && isEnabled;
}