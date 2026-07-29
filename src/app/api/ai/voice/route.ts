import { createSupabaseServerClient } from '@/lib/supabase/server';
import { aiGateway } from '@/server/ai/gateway';
import { personalityEngine } from '@/server/personality/engine';
import { PERSONALITIES } from '@/config/personalities';
import { db } from '@/db';
import { conversationMemory } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { personalityId, scenarioId, emotion, history, currentTranscript } = body;

    // Diagnostic logging — trace exact payload shape
    console.log('[Voice API] Incoming payload:', JSON.stringify({
      personalityId,
      emotion,
      historyLength: history?.length ?? 0,
      currentTranscriptType: typeof currentTranscript,
      currentTranscriptIsArray: Array.isArray(currentTranscript),
      currentTranscriptPreview: typeof currentTranscript === 'string'
        ? currentTranscript.substring(0, 80)
        : JSON.stringify(currentTranscript)?.substring(0, 80),
    }));

    if (!personalityId || !emotion || !currentTranscript) {
      return NextResponse.json(
        { error: 'Missing required fields', received: { personalityId: !!personalityId, emotion: !!emotion, currentTranscript: !!currentTranscript } },
        { status: 400 }
      );
    }

    const personality = PERSONALITIES[personalityId as keyof typeof PERSONALITIES];
    if (!personality) {
      return NextResponse.json({ error: 'Invalid personality' }, { status: 400 });
    }

    // Fetch long-term memory: most recent summary for this user + personality
    let memorySummary: string | undefined;
    try {
      const [lastMemory] = await db
        .select()
        .from(conversationMemory)
        .where(
          and(
            eq(conversationMemory.userId, user.id),
            eq(conversationMemory.personalityId, personalityId)
          )
        )
        .orderBy(desc(conversationMemory.createdAt))
        .limit(1);

      if (lastMemory) {
        const topics = Array.isArray(lastMemory.importantTopics)
          ? (lastMemory.importantTopics as string[]).join(', ')
          : '';
        memorySummary = `${lastMemory.summary}${topics ? ` Previously discussed topics: ${topics}.` : ''}`;
      }
    } catch (memErr) {
      // Non-fatal: proceed without memory if DB query fails
      console.warn('[Voice API] Could not fetch conversation memory:', memErr);
    }

    // Safely normalize currentTranscript into a string regardless of shape
    let currentTranscriptText: string;
    if (typeof currentTranscript === 'string') {
      currentTranscriptText = currentTranscript;
    } else if (Array.isArray(currentTranscript)) {
      currentTranscriptText = currentTranscript
        .map((t: any) => t?.text ?? t?.content ?? (typeof t === 'string' ? t : ''))
        .filter(Boolean)
        .join(' ');
    } else if (typeof currentTranscript === 'object' && currentTranscript !== null) {
      currentTranscriptText = currentTranscript.text ?? currentTranscript.content ?? '';
    } else {
      currentTranscriptText = '';
    }

    if (!currentTranscriptText.trim()) {
      return NextResponse.json({ error: 'currentTranscript resolved to empty string', rawType: typeof currentTranscript }, { status: 400 });
    }

    console.log(`[Voice API] Resolved transcript: "${currentTranscriptText.substring(0, 100)}"`);

    const { systemInstruction, messages } = personalityEngine.buildPrompt({
      personalityId,
      scenarioId,
      emotion,
      memorySummary,
      history: history || [],
      currentTranscript: currentTranscriptText,
    });

    const fullMessages = [
      { role: 'system' as const, content: systemInstruction },
      ...messages
    ];

    // Stream the voice response using Gemini 2.5 Flash
    const response = await aiGateway.streamVoice(
      'gemini-flash-latest',
      fullMessages,
      personality.temperature
    );

    return new Response(response.stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Voice API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
