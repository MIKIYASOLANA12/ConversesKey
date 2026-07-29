import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateProjectInput, UpdateProjectInput } from '@/lib/validations/project.schema';

export class ProjectRepository {
  async findAllByUserId(userId: string) {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async findById(projectId: string, userId: string) {
    const result = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);
    
    return result[0] || null;
  }

  async create(userId: string, data: CreateProjectInput) {
    const result = await db
      .insert(projects)
      .values({
        userId,
        name: data.name,
        color: data.color,
        icon: data.icon,
      })
      .returning();
      
    return result[0];
  }

  async update(projectId: string, userId: string, data: Omit<UpdateProjectInput, 'projectId'>) {
    const result = await db
      .update(projects)
      .set(data)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .returning();
      
    return result[0];
  }

  async delete(projectId: string, userId: string) {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .returning();
      
    return result[0];
  }
}

export const projectRepository = new ProjectRepository();
