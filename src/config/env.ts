import { z } from 'zod';

/**
 * All environment variables are defined and validated here.
 * NEVER access process.env directly outside this file.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Required'),

  // Database
  DATABASE_URL: z.string().min(1, 'Required'),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Must be a valid OpenAI API key'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('Must be a valid URL').default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables — check your .env.local file');
}

export const env = parsed.data;
