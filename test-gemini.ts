import 'dotenv/config';
import { aiGateway } from './src/server/ai/gateway';

async function test() {
  console.log('Testing Gemini API...');
  try {
    const streamRes = await aiGateway.streamVoice('gemini-flash-latest', [
      { role: 'system', content: 'You are a test bot.' },
      { role: 'user', content: 'Hello, say ping.' }
    ]);

    const reader = streamRes.stream.getReader();
    const decoder = new TextDecoder();
    console.log('Stream started. Reading chunks...');
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Chunk:', decoder.decode(value));
    }
    console.log('Stream finished successfully.');
  } catch (err: any) {
    console.error('Test failed:', err);
  }
}

test();
