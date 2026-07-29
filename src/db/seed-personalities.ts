/**
 * Seed script: insert the five core personalities into the `personalities` table.
 * Run with: npx tsx src/db/seed-personalities.ts
 */
import { db } from '.';
import { personalities } from './schema';
import { PERSONALITIES } from '@/config/personalities';

async function seed() {
  console.log('Seeding personalities table...');

  const values = Object.values(PERSONALITIES).map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    description: p.description,
    voice: 'en-US-Standard', // default voice placeholder
    systemPrompt: p.systemPrompt,
    tone: p.tone,
    coachStyle: p.coachStyle,
    interruptBehavior: p.interruptBehavior,
    temperature: p.temperature,
    responseLength: p.responseLength,
  }));

  await db
    .insert(personalities)
    .values(values)
    .onConflictDoNothing(); // Safe to re-run

  console.log(`✅ Seeded ${values.length} personalities.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
