import fs from 'fs';

async function list() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const match = env.match(/GEMINI_API_KEY=(.*)/);
  if (!match) return console.log('no key');
  let key = match[1].replace(/['"]/g, '');
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  console.log(data.models.map((m: any) => m.name).join('\n'));
}

list();
