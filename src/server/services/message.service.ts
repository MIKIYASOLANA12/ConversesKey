import { db } from '@/db';
import { messages, usageLogs } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export class MessageService {
  async getMessages(conversationId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async saveMessage(data: { conversationId: string; role: string; content: string }) {
    const result = await db
      .insert(messages)
      .values({
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
      })
      .returning();
    
    return result[0];
  }

  async logUsage(data: { userId: string; model: string; promptTokens: number; completionTokens: number }) {
    // Very basic cost estimation - production would use real pricing tables
    const costEstimate = ((data.promptTokens * 0.00015) / 1000) + ((data.completionTokens * 0.0006) / 1000);

    try {
      await db.insert(usageLogs).values({
        userId: data.userId,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        costEstimate: costEstimate.toString(),
      });
    } catch (error) {
      // We don't want usage logging failure to break the chat stream, just log it
      logger.error('Failed to log token usage', { error, data });
    }
  }
}

export const messageService = new MessageService();
