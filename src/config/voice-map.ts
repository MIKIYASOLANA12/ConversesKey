import { PersonalityId } from './personalities';

/**
 * Maps each personality to an ElevenLabs voice.
 *
 * To change a voice:
 *   1. Go to https://elevenlabs.io/voice-library
 *   2. Pick a voice and copy its Voice ID
 *   3. Replace the `voiceId` value below
 *
 * Model reference:
 *   - eleven_turbo_v2_5  → lowest latency, good quality (recommended for real-time)
 *   - eleven_multilingual_v2 → highest quality, higher latency
 */

export interface VoiceConfig {
  voiceId: string;
  voiceName: string;
  model: string;
  /** ElevenLabs stability (0–1). Lower = more expressive. */
  stability: number;
  /** ElevenLabs similarity boost (0–1). Higher = closer to original voice. */
  similarityBoost: number;
}

export const VOICE_MAP: Record<PersonalityId, VoiceConfig> = {
  atlas: {
    voiceId: 'NoUyjsAeatQWbXNxlbr7',
    voiceName: 'Atlas Custom',
    model: 'eleven_turbo_v2_5',
    stability: 0.5,
    similarityBoost: 0.75,
  },
  nova: {
    voiceId: 'WUCYIlTMeYQPaF9axbM9',
    voiceName: 'Nova Custom',
    model: 'eleven_turbo_v2_5',
    stability: 0.5,
    similarityBoost: 0.75,
  },
  echo: {
    voiceId: 'NoUyjsAeatQWbXNxlbr7',
    voiceName: 'Atlas Custom',
    model: 'eleven_turbo_v2_5',
    stability: 0.35,
    similarityBoost: 0.8,
  },
  kai: {
    voiceId: 'ErXwobaYiN019PkySvjV',
    voiceName: 'Antoni',
    model: 'eleven_turbo_v2_5',
    stability: 0.45,
    similarityBoost: 0.75,
  },
  luna: {
    voiceId: 'NLjvKPdzhuYmsYg58spO',
    voiceName: 'Luna Custom',
    model: 'eleven_turbo_v2_5',
    stability: 0.6,
    similarityBoost: 0.7,
  },
};

/** Fallback voice if personality is not found */
export const DEFAULT_VOICE: VoiceConfig = VOICE_MAP.nova;
