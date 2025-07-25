import { getFeature, isFeatureEnabled } from '@/packages/database/src';
import { auth } from '@/lib/auth/auth.config';

export async function checkFeature(featureName: string): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;
  
  return isFeatureEnabled(featureName, userId);
}

export async function getFeatureConfig(featureName: string) {
  return getFeature(featureName);
}

// Re-export constants for server-side usage
export { FEATURES, type FeatureName } from './constants';