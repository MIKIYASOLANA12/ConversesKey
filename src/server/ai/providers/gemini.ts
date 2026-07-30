import { GoogleGenAI } from '@google/genai';
import { AIProvider, StreamResponse } from './interface';

// Initialize the client with the API key explicitly from env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Maps internal config model IDs to actual Google AI model names.
 * The config keys are used for routing/lookup; the actual model names are
 * what the Google GenAI API expects.
 */
const MODEL_NAME_MAP: Record<string, string> = {
  'gemini-2.5-flash': 'gemini-2.5-flash',
};

export const geminiAdapter: AIProvider = {
  id: 'google',

  async stream({ model, messages, temperature }) {
    // Map internal config key to actual Google AI model name
    const modelName = MODEL_NAME_MAP[model] ?? model;

    // Convert generic messages to Gemini format
    let systemInstruction: string | undefined;
    const contents: any[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Gemini expects system instructions separately
        systemInstruction = (systemInstruction ? systemInstruction + '\n' : '') + msg.content;
      } else {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }


    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        temperature: temperature ?? 0.7,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return {
      stream,
      // GenAI SDK returns usage in the final chunk, we'll mock or omit usage for now
      // as Vercel AI SDK handles it differently.
    };
  },

  async healthCheck() {
    try {
      await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'ping',
      });
      return true;
    } catch (e) {
      console.error('Gemini Health Check Failed:', e);
      return false;
    }
  },
};
