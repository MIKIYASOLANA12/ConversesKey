import { openAIAdapter } from './src/server/ai/providers/openai.adapter';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  console.log('Testing openAIAdapter...');
  try {
    const res = await openAIAdapter.stream({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say hello world' }],
    });

    const reader = res.stream.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('\nStream done.');
        break;
      }
      const text = decoder.decode(value, { stream: true });
      process.stdout.write(text);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
