import { createSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { voiceSessions, conversationMetrics } from '@/db/schema';
import { NextResponse } from 'next/server';
import { summarizeAndSaveMemory } from '@/server/ai/summarizer';
import { z } from 'zod';

const EndSessionSchema = z.object({
  personalityId: z.string(),
  scenarioId: z.string().optional(),
  emotion: z.string(),
  duration: z.number().int().min(0),
  metrics: z.object({
    confidence: z.number(),
    energy: z.number(),
    pace: z.number(),
    fillerWords: z.number(),
  }),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = EndSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 });
    }

    const { personalityId, scenarioId, emotion, duration, metrics, history } = parsed.data;

    // 1. Insert the voice session record
    const [newSession] = await db.insert(voiceSessions).values({
      userId: user.id,
      personalityId,
      scenarioId: scenarioId || null,
      emotion,
      duration,
      endTime: new Date(),
    }).returning();

    // 2. Insert the final metrics snapshot
    await db.insert(conversationMetrics).values({
      sessionId: newSession.id,
      confidence: Math.round(metrics.confidence),
      energy: Math.round(metrics.energy),
      pace: Math.round(metrics.pace),
      fillerWords: Math.round(metrics.fillerWords),
    });

    // 3. Trigger background summarization — fire and forget, non-blocking
    summarizeAndSaveMemory({
      userId: user.id,
      personalityId,
      emotion,
      history,
      finalMetrics: metrics,
    }).catch(err => console.error('[Sessions/End] Background summarization failed:', err));

    return NextResponse.json({ success: true, sessionId: newSession.id });

  } catch (error: any) {
    console.error('[Sessions/End] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
