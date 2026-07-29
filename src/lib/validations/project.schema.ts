import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(50, 'Name must be under 50 characters'),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateProjectSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z.string().min(1, 'Project name is required').max(50).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  archived: z.boolean().optional(),
});

export const deleteProjectSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
