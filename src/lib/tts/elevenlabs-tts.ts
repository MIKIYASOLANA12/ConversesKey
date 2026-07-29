import { TTSProvider } from './interface';

export class ElevenLabsTTSProvider implements TTSProvider {
  id = 'elevenlabs';
  private audioElement: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;
  private wakeLock: WakeLockSentinel | null = null;
  private isCurrentlySpeaking = false;
  private unlocked = false;
  private activeUrl: string | null = null;

  private speakQueue: Array<{
    text: string;
    options?: { voiceId?: string; personalityId?: string; onBoundary?: (charIndex: number) => void };
    resolve: () => void;
  }> = [];
  private isProcessingQueue = false;

  async init(): Promise<void> {
    return Promise.resolve();
  }

  unlock(): void {
    if (this.unlocked) return;
    
    // Create a SINGLE reusable Audio element
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.autoplay = true;
    }

    // Play a tiny silent base64 audio to unlock the element inside the user gesture
    // This primes the element so we can set its src asynchronously later
    try {
      this.audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      this.audioElement.play().catch(() => {
        // Ignore initial play error, the gesture is still registered
      });
      this.unlocked = true;
      console.log('[ElevenLabs TTS] HTML5 Audio element unlocked');
    } catch (e) {
      console.error('[ElevenLabs TTS] Unlock failed:', e);
    }
  }

  private async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('[ElevenLabs TTS] Wake Lock failed:', err);
      }
    }
  }

  private releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.speakQueue.length === 0) return;
    this.isProcessingQueue = true;

    const item = this.speakQueue.shift()!;
    const { text, options, resolve } = item;

    console.log(`[ElevenLabs TTS] Processing queue item: "${text.substring(0, 50)}..."`);

    try {
      this.abortController = new AbortController();
      this.isCurrentlySpeaking = true;
      await this.requestWakeLock();

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          personalityId: options?.personalityId,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`TTS API failed with status ${response.status}: ${errText}`);
      }

      // Read as ArrayBuffer and convert to Blob
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) throw new Error('TTS API returned empty audio');

      if (this.abortController.signal.aborted) throw new DOMException('Aborted', 'AbortError');

      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      this.activeUrl = url;

      if (!this.audioElement) {
        this.unlock(); // Fallback unlock
        if (!this.audioElement) throw new Error('Audio element not initialized');
      }

      // Cleanup previous ended listener if any
      this.audioElement.onended = null;
      
      // Play the blob
      this.audioElement.src = url;
      await this.audioElement.play();

      console.log('[ElevenLabs TTS] Playback started successfully');

      // Wait for playback to finish
      await new Promise<void>((res, rej) => {
        if (!this.audioElement) return res();
        
        this.audioElement.onended = () => {
          res();
        };
        
        // Also resolve if aborted
        this.abortController?.signal.addEventListener('abort', () => {
          rej(new DOMException('Aborted', 'AbortError'));
        });
      });

      console.log('[ElevenLabs TTS] Playback finished natively');
      
      this.cleanupPlayback();
      resolve();
      this.isProcessingQueue = false;
      this.processQueue();

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[ElevenLabs TTS] Playback aborted');
      } else {
        console.error('[ElevenLabs TTS] Playback error:', err);
      }
      this.cleanupPlayback();
      resolve();
      this.isProcessingQueue = false;
      this.processQueue();
    }
  }

  private cleanupPlayback() {
    this.isCurrentlySpeaking = false;
    this.abortController = null;
    if (this.activeUrl) {
      URL.revokeObjectURL(this.activeUrl);
      this.activeUrl = null;
    }
    this.releaseWakeLock();
  }

  async speak(text: string, options?: { voiceId?: string; personalityId?: string; onBoundary?: (charIndex: number) => void }): Promise<void> {
    if (!text.trim() || !/[a-zA-Z0-9]/.test(text)) return Promise.resolve();

    return new Promise((resolve) => {
      this.speakQueue.push({ text, options, resolve });
      this.processQueue();
    });
  }

  stop(): void {
    while (this.speakQueue.length > 0) {
      this.speakQueue.shift()!.resolve();
    }
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this.cleanupPlayback();
    this.isProcessingQueue = false;
    console.log('[ElevenLabs TTS] Stopped entirely');
  }

  isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }
}

export const elevenLabsTTS = new ElevenLabsTTSProvider();
