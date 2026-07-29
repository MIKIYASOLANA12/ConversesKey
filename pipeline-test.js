/**
 * End-to-end voice pipeline test.
 * Tests BOTH payload shapes:
 *   Case 1: currentTranscript as a string (what the frontend actually sends)
 *   Case 2: currentTranscript as an array (defensive — should also work)
 */
async function testPipeline() {
  console.log('=== VOICE PIPELINE E2E TEST ===\n');

  const testCases = [
    {
      name: 'Case 1: currentTranscript is a STRING (actual frontend behavior)',
      payload: {
        personalityId: 'atlas',
        scenarioId: null,
        emotion: 'neutral',
        history: [],
        currentTranscript: 'Say exactly: Hello world.'
      }
    },
    {
      name: 'Case 2: currentTranscript is an ARRAY (defensive)',
      payload: {
        personalityId: 'atlas',
        scenarioId: null,
        emotion: 'neutral',
        history: [],
        currentTranscript: [{ id: '1', role: 'user', text: 'Say exactly: Hello world.', isFinal: true }]
      }
    },
    {
      name: 'Case 3: currentTranscript is EMPTY STRING (edge case)',
      payload: {
        personalityId: 'atlas',
        scenarioId: null,
        emotion: 'neutral',
        history: [],
        currentTranscript: ''
      }
    },
    {
      name: 'Case 4: currentTranscript is UNDEFINED (edge case)',
      payload: {
        personalityId: 'atlas',
        scenarioId: null,
        emotion: 'neutral',
        history: [],
      }
    },
  ];

  for (const tc of testCases) {
    console.log(`--- ${tc.name} ---`);

    const aiRes = await fetch('http://localhost:3000/api/ai/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tc.payload)
    });

    console.log(`  /api/ai/voice  Status: ${aiRes.status} ${aiRes.statusText}`);

    if (!aiRes.ok) {
      const errBody = await aiRes.text().catch(() => '');
      console.log(`  Error Body: ${errBody.substring(0, 200)}`);

      // Cases 3 and 4 SHOULD return 400, not crash with 500
      if (tc.name.includes('edge case')) {
        if (aiRes.status === 400) {
          console.log(`  PASS: Correctly rejected with 400\n`);
        } else {
          console.log(`  FAIL: Expected 400, got ${aiRes.status}\n`);
        }
      } else {
        console.log(`  FAIL\n`);
      }
      continue;
    }

    // Read the AI stream
    const reader = aiRes.body.getReader();
    const decoder = new TextDecoder();
    let aiText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiText += decoder.decode(value, { stream: true });
    }
    console.log(`  AI Generated: "${aiText.substring(0, 100)}"`);

    // Now test TTS
    const ttsRes = await fetch('http://localhost:3000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: aiText || 'Hello world', personalityId: 'atlas' })
    });

    console.log(`  /api/tts       Status: ${ttsRes.status} ${ttsRes.statusText}`);

    if (ttsRes.ok) {
      const audioBuffer = await ttsRes.arrayBuffer();
      const view = new Uint8Array(audioBuffer);
      const isID3 = view[0] === 0x49 && view[1] === 0x44 && view[2] === 0x33;
      const isMPEG = view[0] === 0xFF && (view[1] & 0xE0) === 0xE0;
      console.log(`  Audio: ${audioBuffer.byteLength} bytes, Valid MP3: ${isID3 || isMPEG}`);
      console.log(`  PASS\n`);
    } else {
      const err = await ttsRes.text().catch(() => '');
      console.log(`  TTS Error: ${err.substring(0, 200)}`);
      console.log(`  FAIL\n`);
    }
  }

  console.log('=== TEST COMPLETE ===');
}

testPipeline();
