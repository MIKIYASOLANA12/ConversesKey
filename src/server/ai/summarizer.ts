import { aiGateway } from '@/server/ai/gateway';
import { db } from '@/db';
import { conversationMemory } from '@/db/schema';

interface SummaryInput {
  userId: string;
  personalityId: string;
  emotion: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  finalMetrics: {
    confidence: number;
    energy: number;
    pace: number;
    fillerWords: number;
  };
}

interface SummaryOutput {
  summary: string;
  importantTopics: string[];
  coachScore: number;
}

/**
 * Uses Gemini to generate a concise memory summary from a conversation transcript.
 * The summary is then persisted in the conversation_memory table for injection
 * into future sessions with the same personality.
 */
export async function summarizeAndSaveMemory(input: SummaryInput): Promise<void> {
  const { userId, personalityId, emotion, history, finalMetrics } = input;

  if (history.length < 2) {
    // Not enough conversation to summarize
    return;
  }

  const transcriptText = history
    .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
    .join('\n');

  const coachScore = Math.round(
    (finalMetrics.confidence * 0.4) +
    (finalMetrics.energy * 0.3) +
    // Normalize pace to 100: 130 wpm is ideal
    (Math.max(0, 100 - Math.abs(finalMetrics.pace - 130)) * 0.3) -
    (finalMetrics.fillerWords * 2)
  );

  const summaryPrompt = `You are a communication coach AI. Based on the conversation transcript below, generate a memory summary that will be injected into the user's NEXT session with this coach.

Focus on:
1. The user's communication strengths and weaknesses.
2. Topics discussed.
3. Specific patterns (e.g., "tends to use 'um' frequently", "speaks confidently about leadership").

Return valid JSON only in this exact format:
{
  "summary": "A 2-3 sentence paragraph about the user's communication style and what they worked on.",
  "importantTopics": ["topic1", "topic2", "topic3"]
}

Conversation Transcript:
${transcriptText}`;

  try {
    const response = await aiGateway.streamVoice(
      'gemini-flash-latest',
      [
        { role: 'user', content: summaryPrompt }
      ],
      0.3
    );

    const reader = response.stream.getReader();
    const decoder = new TextDecoder();
    let rawText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      rawText += decoder.decode(value, { stream: true });
    }

    // Parse the JSON response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found in summary response');

    const parsed: SummaryOutput = JSON.parse(jsonMatch[0]);

    await db.insert(conversationMemory).values({
      userId,
      personalityId,
      emotion,
      coachScore: Math.max(0, Math.min(100, coachScore)),
      importantTopics: parsed.importantTopics,
      summary: parsed.summary,
    });

    console.log(`[Summarizer] Memory saved for user ${userId} with personality ${personalityId}`);
  } catch (err) {
    // Non-fatal: summarization failure should not break the session end flow
    console.error('[Summarizer] Failed to generate or save memory summary:', err);
  }
}
