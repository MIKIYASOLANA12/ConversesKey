import { projectRepository } from '@/server/repositories/project.repository';
import { CreateProjectInput, UpdateProjectInput } from '@/lib/validations/project.schema';
import { logger } from '@/lib/logger';

export class ProjectService {
  async getProjects(userId: string) {
    try {
      return await projectRepository.findAllByUserId(userId);
    } catch (error) {
      logger.error('Failed to fetch projects', { userId, error });
      throw new Error('Failed to fetch projects');
    }
  }

  async getProject(projectId: string, userId: string) {
    try {
      const project = await projectRepository.findById(projectId, userId);
      if (!project) throw new Error('Project not found');
      return project;
    } catch (error) {
      logger.error('Failed to fetch project', { projectId, userId, error });
      throw new Error('Failed to fetch project');
    }
  }

  async createProject(userId: string, data: CreateProjectInput) {
    try {
      const project = await projectRepository.create(userId, data);
      logger.info('Project created', { projectId: project.id, userId });
      return project;
    } catch (error) {
      logger.error('Failed to create project', { userId, data, error });
      throw new Error('Failed to create project');
    }
  }

  async updateProject(userId: string, input: UpdateProjectInput) {
    try {
      const { projectId, ...data } = input;
      const project = await projectRepository.update(projectId, userId, data);
      if (!project) throw new Error('Project not found or unauthorized');
      logger.info('Project updated', { projectId, userId });
      return project;
    } catch (error) {
      logger.error('Failed to update project', { userId, input, error });
      throw new Error('Failed to update project');
    }
  }

  async deleteProject(projectId: string, userId: string) {
    try {
      const project = await projectRepository.delete(projectId, userId);
      if (!project) throw new Error('Project not found or unauthorized');
      logger.info('Project deleted', { projectId, userId });
      return project;
    } catch (error) {
      logger.error('Failed to delete project', { projectId, userId, error });
      throw new Error('Failed to delete project');
    }
  }
}

export const projectService = new ProjectService();
