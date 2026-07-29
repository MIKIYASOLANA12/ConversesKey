'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useBrowserSTT } from '@/lib/stt/use-browser-stt';
import { elevenLabsTTS } from '@/lib/tts/elevenlabs-tts';
import { PersonalityId, Emotion } from '@/config/personalities';
import { ScenarioId } from '@/config/scenarios';

export type CallState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'ended';

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface LiveMetrics {
  confidence: number;
  energy: number;
  pace: number;
  fillerWords: number;
}

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so', 'well'];

export function useVoiceCall(personalityId: PersonalityId, emotion: Emotion, scenarioId?: ScenarioId) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimText, setInterimText] = useState('');
  const [metrics, setMetrics] = useState<LiveMetrics>({ confidence: 70, energy: 60, pace: 120, fillerWords: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for mutable state that doesn't cause re-renders
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wordCountRef = useRef(0);
  const callStartTimeRef = useRef(0);
  const speakStartTimeRef = useRef(0);
  const fillerCountRef = useRef(0);

  // Track call state in a ref so callbacks always see the latest value
  const callStateRef = useRef<CallState>('idle');

  const setCallStateWithRef = useCallback((state: CallState | ((prev: CallState) => CallState)) => {
    setCallState(prev => {
      const next = typeof state === 'function' ? state(prev) : state;
      callStateRef.current = next;
      return next;
    });
  }, []);

  const { startListening, stopListening, error: sttError } = useBrowserSTT();

  // Propagate STT errors to the UI
  useEffect(() => {
    if (sttError) {
      setError(sttError);
      setCallStateWithRef('ended');
    }
  }, [sttError, setCallStateWithRef]);

  // Initialize TTS on mount
  useEffect(() => {
    elevenLabsTTS.init().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Screen WakeLock for Android Chrome STT support
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (e) {
          console.warn('[useVoiceCall] Wake Lock failed:', e);
        }
      }
    };
    if (callState !== 'idle' && callState !== 'ended') {
      requestWakeLock();
    } else {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
      }
    }
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [callState]);

  // ─── AI response ──────────────────────────────────────────────────────────

  const getAIResponse = useCallback(async (userText: string) => {
    console.log(`[useVoiceCall] getAIResponse called with: "${userText.substring(0, 60)}..."`);
    setCallStateWithRef('thinking');

    // Cancel any in-flight stream
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      // Diagnostic logging — trace exact outgoing payload
      console.log('[useVoiceCall] Outgoing currentTranscript:', userText);
      console.log('[useVoiceCall] Type:', typeof userText);
      console.log('[useVoiceCall] Is Array:', Array.isArray(userText));

      console.log('[useVoiceCall] Fetching /api/ai/voice...');
      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalityId,
          scenarioId,
          emotion,
          history: historyRef.current,
          currentTranscript: userText,
        }),
        signal: abortControllerRef.current.signal,
      });

      console.log(`[useVoiceCall] /api/ai/voice responded: ${response.status}`);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Could not read error body');
        console.error(`[useVoiceCall] API error ${response.status}:`, errorBody);
        throw new Error(`API returned ${response.status}: ${errorBody}`);
      }

      if (!response.body) {
        throw new Error('API returned 200 but response.body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let currentSentence = '';

      setCallStateWithRef('speaking');
      console.log('[useVoiceCall] State → speaking, reading stream...');
      
      const speakPromises: Promise<void>[] = [];

      while (true) {
        // Bail out if the call state changed (user interrupted or ended call)
        if (callStateRef.current !== 'speaking' && callStateRef.current !== 'thinking') {
          console.log(`[useVoiceCall] Breaking stream loop — callState is "${callStateRef.current}"`);
          break;
        }

        const { done, value } = await reader.read();

        if (done) {
          // Speak any remaining text
          const remaining = currentSentence.trim();
          console.log(`[useVoiceCall] Stream done. Remaining text: "${remaining.substring(0, 60)}"`);
          if (remaining && callStateRef.current === 'speaking') {
            console.log(`[useVoiceCall] Speaking remaining: "${remaining.substring(0, 60)}"`);
            speakPromises.push(elevenLabsTTS.speak(remaining, { personalityId }));
          }
          break;
        }

        const text = decoder.decode(value, { stream: true });
        fullResponse += text;
        currentSentence += text;

        // Sentence boundary — speak eagerly for lower latency
        if (/[.!?]\s/.test(currentSentence) || /[.!?]$/.test(currentSentence)) {
          const sentenceToSpeak = currentSentence.trim();
          if (sentenceToSpeak && callStateRef.current === 'speaking') {
            console.log(`[useVoiceCall] Sentence detected, sending to TTS: "${sentenceToSpeak.substring(0, 60)}"`);
            // Add to promises so we can await all speech finishing
            speakPromises.push(elevenLabsTTS.speak(sentenceToSpeak, { personalityId }));
          }
          currentSentence = '';
        }
      }
      
      // Wait for all audio to finish playing before going back to listening
      if (speakPromises.length > 0) {
        await Promise.all(speakPromises).catch(console.error);
      }

      console.log(`[useVoiceCall] Full AI response (${fullResponse.length} chars): "${fullResponse.substring(0, 100)}"`);

      // Persist full response in history
      if (fullResponse.trim() && callStateRef.current === 'speaking') {
        const assistantEntry: TranscriptEntry = {
          id: Date.now().toString(),
          role: 'assistant',
          text: fullResponse.trim(),
          timestamp: Date.now(),
        };
        setTranscript(prev => [...prev, assistantEntry]);
        historyRef.current.push({ role: 'assistant', content: fullResponse.trim() });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[useVoiceCall] AI stream aborted (user interrupted)');
      } else {
        console.error('[useVoiceCall] AI API error:', err);
      }
    }

    // Return to listening unless the call was ended externally
    setCallStateWithRef(prev =>
      prev === 'speaking' || prev === 'thinking' ? 'listening' : prev
    );
  }, [personalityId, emotion, scenarioId, setCallStateWithRef]);

  // ─── STT callbacks ────────────────────────────────────────────────────────

  const handleSTTResult = useCallback((result: { transcript: string; isFinal: boolean }) => {
    if (result.isFinal && result.transcript.trim()) {
      setInterimText('');

      const userEntry: TranscriptEntry = {
        id: Date.now().toString(),
        role: 'user',
        text: result.transcript.trim(),
        timestamp: Date.now(),
      };
      setTranscript(prev => [...prev, userEntry]);
      historyRef.current.push({ role: 'user', content: result.transcript.trim() });

      // Live metrics
      const words = result.transcript.trim().split(/\s+/);
      wordCountRef.current += words.length;
      const fillers = words.filter(w => FILLER_WORDS.some(f => f === w.toLowerCase())).length;
      fillerCountRef.current += fillers;

      const elapsedMinutes = (Date.now() - speakStartTimeRef.current) / 60_000;
      const wpm = elapsedMinutes > 0 ? Math.round(wordCountRef.current / elapsedMinutes) : 130;

      setMetrics(prev => ({
        confidence: Math.min(100, Math.max(30, prev.confidence + (fillers > 0 ? -5 : 3))),
        energy: Math.min(100, Math.max(20, prev.energy + (words.length > 10 ? 5 : -2))),
        pace: wpm,
        fillerWords: fillerCountRef.current,
      }));

      getAIResponse(result.transcript.trim());
    } else {
      setInterimText(result.transcript);
    }
  }, [getAIResponse]);

  /**
   * Called when the STT detects the user has started speaking.
   * Only interrupts the AI when it is actively speaking (not while it's thinking).
   * Ignores very short noise bursts (< 5 chars) to avoid false interruptions.
   */
  const handleUserInterruption = useCallback((text?: string) => {
    if (text && text.length < 5) return; // ignore tiny noise bursts

    if (callStateRef.current === 'speaking') {
      console.log('[useVoiceCall] User interrupted AI');
      elevenLabsTTS.stop();
      abortControllerRef.current?.abort();
      setCallStateWithRef('listening');
    }
  }, [setCallStateWithRef]);

  // ─── Call controls ────────────────────────────────────────────────────────

  const startCall = useCallback(async () => {
    console.log(`[useVoiceCall] startCall called. isInitialized=${isInitialized}`);
    if (!isInitialized) return;

    setCallStateWithRef('connecting');
    setError(null);
    callStartTimeRef.current = Date.now();
    speakStartTimeRef.current = Date.now();

    // IMPORTANT: unlock() MUST be called synchronously inside this click handler.
    // Android Chrome only permits autoplay when the call stack originates from a user gesture.
    elevenLabsTTS.unlock();
    console.log('[useVoiceCall] TTS unlocked');

    // Start the microphone. If it fails (permission denied etc.) we stop here.
    await startListening(handleSTTResult, handleUserInterruption);
    console.log(`[useVoiceCall] STT started. callStateRef=${callStateRef.current}`);

    // If STT setup succeeded we'll be in 'connecting'; trigger initial AI greeting.
    if (callStateRef.current === 'connecting') {
      console.log('[useVoiceCall] Triggering initial AI greeting...');
      getAIResponse(
        '[System: The user just joined. Please greet them warmly, introduce yourself briefly, and ask how you can help. Keep it to 1-2 sentences.]'
      );
    } else {
      console.warn(`[useVoiceCall] NOT triggering greeting — callState is "${callStateRef.current}"`);
    }
    // If STT failed, sttError will be set and the useEffect above will handle state.
  }, [isInitialized, startListening, handleSTTResult, handleUserInterruption, setCallStateWithRef, getAIResponse]);

  const toggleMute = useCallback(() => {
    setCallStateWithRef(prev => {
      if (prev === 'listening') {
        stopListening();
        return 'muted';
      } else if (prev === 'muted') {
        startListening(handleSTTResult, handleUserInterruption);
        return 'listening';
      }
      return prev;
    });
  }, [startListening, stopListening, handleSTTResult, handleUserInterruption, setCallStateWithRef]);

  const endCall = useCallback((finalMetrics?: LiveMetrics) => {
    elevenLabsTTS.stop();
    stopListening();
    abortControllerRef.current?.abort();
    setCallStateWithRef('ended');

    // Persist session — fire and forget
    const durationSeconds = Math.round((Date.now() - callStartTimeRef.current) / 1000);
    if (historyRef.current.length > 0 && durationSeconds > 0) {
      fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalityId,
          scenarioId,
          emotion,
          duration: durationSeconds,
          metrics: finalMetrics ?? { confidence: 70, energy: 60, pace: 120, fillerWords: 0 },
          history: historyRef.current,
        }),
      }).catch(err => console.error('[useVoiceCall] Failed to save session:', err));
    }

    return historyRef.current;
  }, [stopListening, setCallStateWithRef, personalityId, scenarioId, emotion]);

  return {
    callState,
    transcript,
    interimText,
    metrics,
    isInitialized,
    error,
    startCall,
    toggleMute,
    endCall,
  };
}