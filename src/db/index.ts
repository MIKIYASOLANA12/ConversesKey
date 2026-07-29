import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envFile = fs.readFileSync(envPath, 'utf8');

  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) return;

    const index = trimmed.indexOf('=');

    if (index === -1) return;

    const key = trimmed.substring(0, index);
    let value = trimmed.substring(index + 1);

    value = value.replace(/^["']|["']$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    'DATABASE_URL missing. Check your .env.local file'
  );
}

console.log("Database connected:", connectionString.split('@')[1]);

const client = postgres(connectionString);

export const db = drizzle(client, {
  schema,
});

export * from './schema';
