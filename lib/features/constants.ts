export const FEATURES = {
  CHAT: 'chat',
  DARK_MODE: 'darkMode',
  BETA_FEATURES: 'betaFeatures',
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  FILE_UPLOAD: 'fileUpload',
  VOICE_CHAT: 'voiceChat',
} as const;

export type FeatureName = typeof FEATURES[keyof typeof FEATURES];