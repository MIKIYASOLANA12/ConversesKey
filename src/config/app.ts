export const APP_CONFIG = {
  name: 'ConverseKey',
  description: 'A professional AI workspace for organizing, searching, and revisiting your AI conversations.',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;
