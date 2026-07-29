import { PERSONALITIES, EMOTION_PROMPTS, PersonalityId, Emotion } from '@/config/personalities';
import { SCENARIOS, ScenarioId } from '@/config/scenarios';

export interface PromptContext {
  personalityId: PersonalityId;
  emotion: Emotion;
  scenarioId?: ScenarioId;
  memorySummary?: string;
  history: { role: 'user' | 'assistant', content: string }[];
  currentTranscript: string;
}

export class PersonalityEngine {
  
  /**
   * Builds the complete prompt pipeline as defined in the spec:
   * System Prompt -> Personality Prompt -> Scenario Prompt -> Emotion Prompt -> Memory -> History -> Transcript
   */
  buildPrompt(context: PromptContext): { systemInstruction: string, messages: { role: 'user' | 'assistant', content: string }[] } {
    const personality = PERSONALITIES[context.personalityId];
    if (!personality) throw new Error(`Personality ${context.personalityId} not found`);

    const emotionInstruction = EMOTION_PROMPTS[context.emotion] || EMOTION_PROMPTS['Calm'];

    let systemInstruction = `[SYSTEM] You are part of the ConverseKey Voice Workspace.\n`;
    systemInstruction += `[PERSONALITY] ${personality.systemPrompt}\n`;
    
    if (context.scenarioId) {
       const scenario = SCENARIOS[context.scenarioId];
       if (scenario) {
         systemInstruction += `[SCENARIO] ${scenario.prompt}\n`;
       }
    }

    systemInstruction += `[TONE] ${personality.tone}\n`;
    systemInstruction += `[INTERRUPT BEHAVIOR] ${personality.interruptBehavior}\n`;
    systemInstruction += `[EMOTION] ${emotionInstruction}\n`;
    
    if (context.memorySummary) {
      systemInstruction += `[MEMORY FROM PREVIOUS SESSIONS] ${context.memorySummary}\n`;
    }

    systemInstruction += `\nCRITICAL INSTRUCTIONS:\n`;
    systemInstruction += `- Your response will be spoken via Text-To-Speech. DO NOT use markdown, bolding, bullet points, or special characters. Use natural punctuation.\n`;
    systemInstruction += `- Keep your responses ${personality.responseLength} to allow a natural conversational flow.\n`;

    const messages = [...context.history, { role: 'user' as const, content: context.currentTranscript }];

    return {
      systemInstruction,
      messages
    };
  }
}

export const personalityEngine = new PersonalityEngine();
