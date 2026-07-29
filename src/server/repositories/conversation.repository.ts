import { db } from '@/db';
import { conversations, projects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CreateConversationInput } from '@/lib/validations/conversation.schema';

export class ConversationRepository {
  async findAllByProjectId(projectId: string, userId: string) {
    // Verify user owns the project first
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);

    if (!project[0]) throw new Error('Project not found or unauthorized');

    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.projectId, projectId))
      .orderBy(desc(conversations.createdAt));
  }

  async findById(conversationId: string, userId: string) {
    const result = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);
    
    return result[0] || null;
  }

  async create(userId: string, data: CreateConversationInput) {
    // Verify user owns the project
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .limit(1);

    if (!project[0]) throw new Error('Project not found or unauthorized');

    const result = await db
      .insert(conversations)
      .values({
        userId,
        projectId: data.projectId,
        title: data.title,
        model: data.model,
      })
      .returning();
      
    return result[0];
  }

  async delete(conversationId: string, userId: string) {
    const result = await db
      .delete(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .returning();
      
    return result[0];
  }
}

export const conversationRepository = new ConversationRepository();
