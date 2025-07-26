'use client';

import { useState, useEffect } from 'react';
import { Card, Toggle } from '@chat/ui';
import { IconFlask2 } from '@tabler/icons-react';
import { useFeature } from '@/lib/features/hooks/use-feature';
import { FEATURES } from '@/lib/features/constants';

interface BetaFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export function BetaFeaturesSection() {
  const [betaFeatures, setBetaFeatures] = useState<BetaFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const betaAccessEnabled = useFeature(FEATURES.BETA_FEATURES);

  useEffect(() => {
    if (betaAccessEnabled) {
      loadBetaFeatures();
    } else {
      setLoading(false);
    }
  }, [betaAccessEnabled]);

  async function loadBetaFeatures() {
    try {
      // Mock beta features for now - in a real app, this would come from an API
      const mockFeatures: BetaFeature[] = [
        {
          id: 'voiceChat',
          name: 'Voice Chat',
          description: 'Voice chat capabilities for task discussions',
          enabled: false
        },
        {
          id: 'advancedAnalytics',
          name: 'Advanced Analytics',
          description: 'Detailed project metrics and insights',
          enabled: false
        },
        {
          id: 'aiAssistant',
          name: 'AI Assistant (Coming Soon)',
          description: 'AI-powered task suggestions and automation',
          enabled: false
        }
      ];
      setBetaFeatures(mockFeatures);
    } catch (error) {
      console.error('Failed to load beta features:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBetaFeature(featureId: string) {
    // In a real app, this would make an API call to toggle the feature for the user
    setBetaFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  }

  if (!betaAccessEnabled) {
    return (
      <Card className="p-6 border-dashed">
        <div className="flex items-center gap-4">
          <IconFlask2 className="h-6 w-6 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold text-muted-foreground">Beta Features</h2>
            <p className="text-sm text-muted-foreground">
              Beta features are not available for your account. Contact your administrator for access.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <IconFlask2 className="h-6 w-6 text-muted-foreground" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4">Beta Features</h2>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <IconFlask2 className="h-6 w-6 text-muted-foreground mt-1" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Beta Features</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Try out experimental features before they&apos;re released to everyone. These features may change or be removed.
          </p>
          
          <div className="space-y-4">
            {betaFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{feature.name}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Toggle
                  checked={feature.enabled}
                  onChange={() => toggleBetaFeature(feature.id)}
                  disabled={feature.id === 'aiAssistant'}
                  size="md"
                  data-testid={`toggle-beta-${feature.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}