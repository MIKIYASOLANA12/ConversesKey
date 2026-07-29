import { GoogleGenAI } from '@google/genai';
import { AIProvider, StreamResponse } from './interface';

// Initialize the client with the API key explicitly from env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiAdapter: AIProvider = {
  id: 'google',

  async stream({ model, messages, temperature }) {
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
      model: model,
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
        model: 'gemini-flash-latest',
        contents: 'ping',
      });
      return true;
    } catch (e) {
      console.error('Gemini Health Check Failed:', e);
      return false;
    }
  },
};
