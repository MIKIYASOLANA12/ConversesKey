import { AIProvider, StreamResponse } from './interface';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { ModelMessage } from '@ai-sdk/provider-utils';

export class OpenAIAdapter implements AIProvider {
  id = 'openai';

  async stream({
    model,
    messages,
    temperature = 0.7,
  }: {
    model: string;
    messages: ModelMessage[];
    temperature?: number;
  }): Promise<StreamResponse> {
    const systemMessage = messages.find(m => m.role === 'system')?.content as string | undefined;
    const coreMessages = messages.filter(m => m.role !== 'system');

    const result = streamText({
      model: openai(model),
      system: systemMessage,
      messages: coreMessages,
      temperature,
    });

    const encoder = new TextEncoder();
    const rawStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    return {
      stream: rawStream,
      usage: async () => {
        const usage = await result.usage;
        return {
          promptTokens: usage.inputTokens ?? 0,
          completionTokens: usage.outputTokens ?? 0,
        };
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!process.env.OPENAI_API_KEY) return false;
      return true;
    } catch {
      return false;
    }
  }
}

export const openAIAdapter = new OpenAIAdapter();
