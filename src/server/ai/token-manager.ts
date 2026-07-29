import { AI_MODELS, AIModelId, OUTPUT_TOKEN_RESERVE } from '@/config/ai';

export class TokenManager {
  /**
   * Extremely fast heuristic token estimation.
   * On average, 1 token ≈ 4 characters for English text.
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if a series of messages fits within the model's budget.
   */
  estimateMessageTokens(messages: { role: string; content: string }[]): number {
    return messages.reduce((acc, msg) => {
      // Base overhead per message
      return acc + this.estimateTokens(msg.content) + 4;
    }, 0);
  }

  /**
   * Trims the conversation history to fit within the model's context window.
   * Leaves enough room for the output token reserve.
   */
  trimHistory(
    modelId: AIModelId,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  ) {
    const config = AI_MODELS[modelId];
    if (!config) throw new Error(`Unknown model: ${modelId}`);

    const maxInputTokens = config.maxInputTokens - OUTPUT_TOKEN_RESERVE;
    
    // Always keep the system prompt (usually the first message)
    const systemMessage = messages.find(m => m.role === 'system');
    const systemTokens = systemMessage ? this.estimateMessageTokens([systemMessage]) : 0;

    // We process from newest (end of array) to oldest, keeping as much as possible
    const reversedHistory = messages.filter(m => m.role !== 'system').reverse();
    
    let currentTokens = systemTokens;
    const keptMessages = [];

    for (const msg of reversedHistory) {
      const msgTokens = this.estimateMessageTokens([msg]);
      if (currentTokens + msgTokens > maxInputTokens) {
        break; // Stop adding if we exceed the budget
      }
      currentTokens += msgTokens;
      keptMessages.push(msg);
    }

    // Restore chronological order and prepend system message
    keptMessages.reverse();
    if (systemMessage) {
      return [systemMessage, ...keptMessages];
    }
    
    return keptMessages;
  }
}

export const tokenManager = new TokenManager();
