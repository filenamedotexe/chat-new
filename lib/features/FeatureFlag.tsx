'use client';

import { useFeature } from './useFeature';
interface FeatureFlagProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ feature, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeature(feature);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}