/**
 * Feature flags — all feature gating must use this file.
 * Never use process.env or string literals to gate features.
 */
export const FEATURES = {
  // MVP — enabled
  streaming: true,
  search: true,
  darkMode: true,

  // Deferred — do not implement yet
  vision: false,
  voice: false,
  teams: false,
  fileUploads: false,
  promptTemplates: false,
  memory: false,
  multiProvider: false,
  billing: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
