import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { VOICE_MAP, DEFAULT_VOICE } from '@/config/voice-map';
import type { PersonalityId } from '@/config/personalities';

/**
 * POST /api/tts
 *
 * Server-side proxy to ElevenLabs streaming TTS.
 * The browser NEVER sees the ELEVENLABS_API_KEY.
 *
 * Request body: { text: string, personalityId: string }
 * Response: streaming audio/mpeg
 */
export async function POST(req: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Validate API key ──────────────────────────────────────────────────
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('[TTS API] ELEVENLABS_API_KEY is not set');
    return NextResponse.json(
      { error: 'ElevenLabs API key is not configured. Add ELEVENLABS_API_KEY to .env.local' },
      { status: 500 }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let text: string;
  let personalityId: string;
  try {
    const body = await req.json();
    text = body.text;
    personalityId = body.personalityId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  // ── Resolve voice ─────────────────────────────────────────────────────
  const voice = VOICE_MAP[personalityId as PersonalityId] ?? DEFAULT_VOICE;

  // ── Call ElevenLabs ───────────────────────────────────────────────────
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}/stream`;

  try {
    const elevenRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: voice.model,
        voice_settings: {
          stability: voice.stability,
          similarity_boost: voice.similarityBoost,
        },
        // Optimize for streaming latency
        optimize_streaming_latency: 3,
      }),
      // Forward the client's abort signal so we cancel upstream when the user interrupts
      signal: req.signal,
    });

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text().catch(() => '');
      console.error(`[TTS API] ElevenLabs returned ${elevenRes.status}: ${errorText}`);

      if (elevenRes.status === 401) {
        return NextResponse.json({ error: 'ElevenLabs API key is invalid' }, { status: 502 });
      }
      if (elevenRes.status === 429) {
        return NextResponse.json({ error: 'ElevenLabs quota exhausted. Upgrade your plan at elevenlabs.io' }, { status: 429 });
      }
      return NextResponse.json(
        { error: `ElevenLabs error: ${elevenRes.status}` },
        { status: 502 }
      );
    }

    if (!elevenRes.body) {
      return NextResponse.json({ error: 'No audio stream from ElevenLabs' }, { status: 502 });
    }

    // Stream the audio bytes directly to the browser
    return new Response(elevenRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // Client cancelled — perfectly normal during interruption
      return new Response(null, { status: 499 });
    }
    console.error('[TTS API] Unexpected error:', err);
    return NextResponse.json({ error: 'TTS service unavailable' }, { status: 500 });
  }
}
