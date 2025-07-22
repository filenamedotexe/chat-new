'use client';

import { useFeature } from './useFeature';
import type { FeatureName } from './featureFlags';

interface FeatureFlagProps {
  feature: FeatureName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ feature, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeature(feature);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}