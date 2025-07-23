import { getFeature, isFeatureEnabled } from '@chat/database';
import { auth } from '@/lib/auth/auth.config';

export async function checkFeature(featureName: string): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;
  
  return isFeatureEnabled(featureName, userId);
}

export async function getFeatureConfig(featureName: string) {
  return getFeature(featureName);
}

export const FEATURES = {
  CHAT: 'chat',
  DARK_MODE: 'darkMode',
  BETA_FEATURES: 'betaFeatures',
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  FILE_UPLOAD: 'fileUpload',
  VOICE_CHAT: 'voiceChat',
} as const;

export type FeatureName = typeof FEATURES[keyof typeof FEATURES];