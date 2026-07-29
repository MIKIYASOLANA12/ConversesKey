import { SYSTEM_PROMPT } from '@/config/ai';
import { tokenManager } from './token-manager';

export class PromptBuilder {
  /**
   * Builds the final array of messages to send to the provider.
   * Injects the system prompt and trims history to fit token limits.
   */
  buildMessages(
    modelId: any,
    history: { role: 'user' | 'assistant'; content: string }[],
    newPrompt: string
  ): { role: 'user' | 'assistant' | 'system'; content: string }[] {
    
    const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: newPrompt },
    ];

    return tokenManager.trimHistory(modelId, messages);
  }
}

export const promptBuilder = new PromptBuilder();
