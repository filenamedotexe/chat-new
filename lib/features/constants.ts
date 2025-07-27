export const FEATURES = {
  CHAT: 'chat',
  SUPPORT_CHAT: 'supportChat',
  DARK_MODE: 'darkMode',
  BETA_FEATURES: 'betaFeatures',
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  FILE_UPLOAD: 'fileUpload',
  VOICE_CHAT: 'voiceChat',
  SUPABASE_AUTH: 'supabaseAuth',
} as const;

export type FeatureName = typeof FEATURES[keyof typeof FEATURES];