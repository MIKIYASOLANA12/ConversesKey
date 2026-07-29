import { conversationRepository } from '@/server/repositories/conversation.repository';
import { CreateConversationInput } from '@/lib/validations/conversation.schema';
import { logger } from '@/lib/logger';

export class ConversationService {
  async getConversations(projectId: string, userId: string) {
    try {
      return await conversationRepository.findAllByProjectId(projectId, userId);
    } catch (error) {
      logger.error('Failed to fetch conversations', { projectId, userId, error });
      throw new Error('Failed to fetch conversations');
    }
  }

  async getConversation(conversationId: string, userId: string) {
    try {
      const conversation = await conversationRepository.findById(conversationId, userId);
      if (!conversation) throw new Error('Conversation not found');
      return conversation;
    } catch (error) {
      logger.error('Failed to fetch conversation', { conversationId, userId, error });
      throw new Error('Failed to fetch conversation');
    }
  }

  async createConversation(userId: string, data: CreateConversationInput) {
    try {
      const conversation = await conversationRepository.create(userId, data);
      logger.info('Conversation created', { conversationId: conversation.id, userId });
      return conversation;
    } catch (error) {
      logger.error('Failed to create conversation', { userId, data, error });
      throw new Error('Failed to create conversation');
    }
  }

  async deleteConversation(conversationId: string, userId: string) {
    try {
      const conversation = await conversationRepository.delete(conversationId, userId);
      if (!conversation) throw new Error('Conversation not found or unauthorized');
      logger.info('Conversation deleted', { conversationId, userId });
      return conversation;
    } catch (error) {
      logger.error('Failed to delete conversation', { conversationId, userId, error });
      throw new Error('Failed to delete conversation');
    }
  }
}

export const conversationService = new ConversationService();
