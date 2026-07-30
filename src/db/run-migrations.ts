import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  console.log('Connecting to', process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected!');
  
  const dir = './src/db/migrations';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    console.log(`Running ${f}...`);
    const query = fs.readFileSync(path.join(dir, f), 'utf8');
    await client.query(query);
  }
  
  await client.end();
  console.log('Done!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
