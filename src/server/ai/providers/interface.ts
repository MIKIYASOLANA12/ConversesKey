export interface StreamResponse {
  stream: any; // ReadableStream or standard async generator
  usage?: () => Promise<{ promptTokens: number; completionTokens: number }>;
}

export interface AIProvider {
  /** Uniquely identifies the provider (e.g. 'openai', 'anthropic') */
  id: string;

  /**
   * Generates a streaming response given a prompt and history.
   * Relies on Vercel AI SDK abstractions under the hood.
   */
  stream(options: {
    model: string;
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
    temperature?: number;
  }): Promise<StreamResponse>;

  /**
   * Quick health check to ensure API keys and connectivity are valid.
   */
  healthCheck(): Promise<boolean>;
}
