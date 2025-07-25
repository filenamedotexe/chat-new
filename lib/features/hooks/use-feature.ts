'use client';

import React, { useState, useEffect } from 'react';
import { type FeatureName } from '../constants';

export function useFeature(featureName: FeatureName): boolean {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFeature() {
      try {
        const response = await fetch(`/api/features/${featureName}/check`);
        if (response.ok) {
          const data = await response.json();
          setEnabled(data.enabled);
        }
      } catch (error) {
        console.error('Failed to check feature:', error);
      } finally {
        setLoading(false);
      }
    }

    checkFeature();
  }, [featureName]);

  // Return false while loading to prevent feature flash
  return !loading && enabled;
}

// HOC for feature-gated components
export function withFeature<P extends object>(
  Component: React.ComponentType<P>,
  featureName: FeatureName,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureGatedComponent(props: P) {
    const enabled = useFeature(featureName);

    if (!enabled) {
      return FallbackComponent ? React.createElement(FallbackComponent, props) : null;
    }

    return React.createElement(Component, props);
  };
}