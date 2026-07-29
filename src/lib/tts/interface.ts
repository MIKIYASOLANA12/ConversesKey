export interface TTSProvider {
  /** Uniquely identifies the provider (e.g. 'browser', 'elevenlabs') */
  id: string;

  /**
   * Initializes the TTS engine (e.g., pre-loading voices).
   */
  init(): Promise<void>;

  /**
   * Speaks the provided text.
   * Resolves when speech completes or is interrupted.
   */
  speak(text: string, options?: { voiceId?: string; personalityId?: string; onBoundary?: (charIndex: number) => void }): Promise<void>;

  /**
   * Immediately stops any ongoing speech.
   */
  stop(): void;

  /**
   * Checks if the TTS engine is currently speaking.
   */
  isSpeaking(): boolean;
}
