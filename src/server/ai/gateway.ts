import { AIProvider, StreamResponse } from './providers/interface';
import { openAIAdapter } from './providers/openai.adapter';
import { geminiAdapter } from './providers/gemini';
import { promptBuilder } from './prompt-builder';
import { AI_MODELS, AIModelId } from '@/config/ai';
import type { ModelMessage } from '@ai-sdk/provider-utils';

export class AIGateway {
  private providers: Map<string, AIProvider>;

  constructor() {
    this.providers = new Map();
    // Register providers
    this.providers.set('openai', openAIAdapter);
    this.providers.set('google', geminiAdapter);
  }

  /**
   * Primary entry point for all AI calls.
   * Handles provider routing, prompt building, and token management.
   */
  async streamChat(
    modelId: AIModelId,
    history: { role: 'user' | 'assistant'; content: string }[],
    prompt: string
  ): Promise<StreamResponse> {
    const config = AI_MODELS[modelId];
    if (!config) throw new Error(`Model not supported: ${modelId}`);

    const provider = this.providers.get(config.provider);
    if (!provider) throw new Error(`Provider not configured: ${config.provider}`);

    // Build and trim context
    const messages = promptBuilder.buildMessages(modelId, history, prompt);

    // Call provider
    return provider.stream({
      model: modelId,
      messages,
    });
  }

  /**
   * Used specifically for voice conversations with custom prompt pipelines
   * (built via PersonalityEngine).
   */
  async streamVoice(
    modelId: AIModelId,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    temperature?: number
  ): Promise<StreamResponse> {
    const config = AI_MODELS[modelId];
    if (!config) throw new Error(`Model not supported: ${modelId}`);

    const provider = this.providers.get(config.provider);
    if (!provider) throw new Error(`Provider not configured: ${config.provider}`);

    return provider.stream({
      model: modelId,
      messages,
      temperature
    });
  }
}

export const aiGateway = new AIGateway();
