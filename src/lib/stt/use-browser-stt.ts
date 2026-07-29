'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface STTResult {
  transcript: string;
  isFinal: boolean;
}

// Type the SpeechRecognition API (not yet in standard TS DOM lib)
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function useBrowserSTT() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const onResultCallbackRef = useRef<((result: STTResult) => void) | null>(null);
  const onStartSpeakingCallbackRef = useRef<((text: string) => void) | null>(null);

  // Track intentional stop so the auto-restart loop knows when to stop
  const isIntentionalStopRef = useRef(false);
  // Track whether recognition is actively running to prevent double-start
  const isRunningRef = useRef(false);
  // Track whether startListening has been called at all
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError(
        'Speech Recognition is not supported in this browser. ' +
        'Please use Chrome or Edge on Android, or Safari on iOS.'
      );
      return;
    }

    const recognition = new (SpeechRecognitionCtor as new () => ISpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRunningRef.current = true;
      setIsListening(true);
      setError(null);
      console.log('[STT] started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Notify caller of interim text so it can detect user-started speaking
      if (interimTranscript.trim() && onStartSpeakingCallbackRef.current) {
        onStartSpeakingCallbackRef.current(interimTranscript.trim());
      }

      if (finalTranscript.trim() && onResultCallbackRef.current) {
        console.log(`[STT] result (final): "${finalTranscript.trim().substring(0, 60)}"`);
        onResultCallbackRef.current({ transcript: finalTranscript.trim(), isFinal: true });
      } else if (interimTranscript.trim() && onResultCallbackRef.current) {
        onResultCallbackRef.current({ transcript: interimTranscript.trim(), isFinal: false });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error(`[STT] error: ${event.error}`);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        isIntentionalStopRef.current = true;
        isRunningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        // Not a real error — Chrome fires this after silence; onend will restart
        console.log('[STT] no-speech (will auto-restart if call is active)');
      } else if (event.error === 'network') {
        // Transient network error on Chrome — let onend handle restart
        console.warn('[STT] network error — will attempt restart');
      } else {
        // For any other error, log but still let onend decide whether to restart
        console.warn(`[STT] non-fatal error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      isRunningRef.current = false;
      setIsListening(false);
      console.log('[STT] stopped');

      // Auto-restart only when:
      //  1. The user hasn't intentionally stopped the call
      //  2. We actually have a live call (hasStartedRef)
      //  3. There is a result callback registered (call is in progress)
      if (
        !isIntentionalStopRef.current &&
        hasStartedRef.current &&
        recognitionRef.current
      ) {
        // Small delay to let the browser settle before restarting
        // (Android Chrome needs ~200 ms; desktop is fine with 0)
        setTimeout(() => {
          if (
            !isIntentionalStopRef.current &&
            recognitionRef.current &&
            !isRunningRef.current
          ) {
            try {
              recognitionRef.current.start();
              console.log('[STT] auto-restarted after unexpected stop');
            } catch (e) {
              console.warn('[STT] auto-restart failed:', e);
            }
          }
        }, 250);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isIntentionalStopRef.current = true;
      hasStartedRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch (_) { /* ignore */ }
    };
  }, []);

  const startListening = useCallback(
    async (
      onResult: (result: STTResult) => void,
      onStartSpeaking?: (text: string) => void
    ) => {
      // Defensive check: make sure mediaDevices is available (Android WebView may not have it)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone access is not available in this browser or context.');
        return;
      }

      // Request microphone permission explicitly — surfaces a nice error on denial
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the tracks immediately so SpeechRecognition can acquire the microphone
        stream.getTracks().forEach(track => track.stop());
        setError(null);
      } catch (err: any) {
        console.error('[STT] Microphone access denied:', err);
        setError('Microphone permission denied. Please allow microphone access.');
        return;
      }

      if (!recognitionRef.current) {
        setError(
          'Speech Recognition is not supported in this browser. ' +
          'Please use Chrome or Edge.'
        );
        return;
      }

      onResultCallbackRef.current = onResult;
      onStartSpeakingCallbackRef.current = onStartSpeaking ?? null;
      isIntentionalStopRef.current = false;
      hasStartedRef.current = true;

      if (!isRunningRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('[STT] Failed to start recognition:', e);
        }
      }
    },
    [] // no deps — all state is managed through refs
  );

  const stopListening = useCallback(() => {
    isIntentionalStopRef.current = true;
    hasStartedRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) { /* ignore */ }
    }
    isRunningRef.current = false;
    setIsListening(false);
  }, []);

  return { isListening, error, startListening, stopListening };
}