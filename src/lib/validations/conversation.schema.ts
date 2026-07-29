import { z } from 'zod';

export const createConversationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required').max(100),
  model: z.string().min(1, 'Model is required'),
});

export const deleteConversationSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type DeleteConversationInput = z.infer<typeof deleteConversationSchema>;
