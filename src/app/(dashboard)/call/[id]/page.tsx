'use client';

import { useParams, useRouter } from 'next/navigation';
import { PERSONALITIES, PersonalityId, Emotion } from '@/config/personalities';
import { SCENARIOS, ScenarioId } from '@/config/scenarios';
import { VoiceOrb } from '@/components/voice/VoiceOrb';
import { CoachPanel, Suggestion } from '@/components/voice/CoachPanel';
import { VoiceSidebar } from '@/components/voice/VoiceSidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PhoneOff,
  Mic,
  MicOff,
  ChevronLeft,
  Radio,
  BrainCircuit,
  Volume2,
  CircleStop,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCall, CallState, LiveMetrics } from '@/lib/hooks/use-voice-call';
import { elevenLabsTTS } from '@/lib/tts/elevenlabs-tts';
import { cn } from '@/lib/utils';

const EMOTIONS: Emotion[] = ['Calm', 'Happy', 'Serious', 'Motivational', 'Roast'];

const STATE_LABELS: Record<CallState, string> = {
  idle: 'Ready',
  connecting: 'Connecting…',
  listening: 'Listening',
  thinking: 'Thinking…',
  speaking: 'Speaking',
  muted: 'Muted',
  ended: 'Call Ended',
};

const STATE_COLORS: Record<CallState, string> = {
  idle: 'text-muted-foreground',
  connecting: 'text-yellow-400',
  listening: 'text-green-400',
  thinking: 'text-blue-400',
  speaking: 'text-primary',
  muted: 'text-orange-400',
  ended: 'text-destructive',
};

function formatDuration(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateCoachSuggestion(text: string, personality: PersonalityId, metrics: LiveMetrics): Suggestion | null {
  const lowerText = text.toLowerCase();
  const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually'];
  const weakWords = ['i think maybe', "i'm not sure", 'kind of', 'sort of', 'i guess'];

  const hasFillers = fillers.some(f => lowerText.includes(f));
  const hasWeakWords = weakWords.some(w => lowerText.includes(w));
  const words = text.split(/\s+/).length;

  const isRoaster = personality === 'echo';
  const isStrict = personality === 'atlas';

  if (metrics.pace > 160) {
    return {
      id: Date.now().toString(),
      type: isRoaster ? 'roast' : 'warning',
      text: isRoaster ? "🏎️ Whoa Eminem, slow down. Nobody can understand you." : "⚠️ You're speaking very fast. Try to pause and breathe.",
      timestamp: Date.now(),
    };
  }

  if (metrics.fillerWords > 5) {
    return {
      id: Date.now().toString(),
      type: isRoaster ? 'roast' : 'warning',
      text: isRoaster ? `💀 Bro said 'um' ${metrics.fillerWords} times. Try... words?` : '⚠️ Excessive filler words detected. Embrace the silence instead.',
      timestamp: Date.now(),
    };
  }

  if (hasWeakWords) {
    return {
      id: Date.now().toString(),
      type: 'warning',
      text: '❌ Avoid "I think maybe…" → Use "I believe…" to project confidence.',
      timestamp: Date.now(),
    };
  }

  if (metrics.confidence < 50) {
    return {
      id: Date.now().toString(),
      type: isRoaster ? 'roast' : 'tip',
      text: isRoaster ? "You sound terrified. Own it." : "💡 Speak up with a bit more conviction. You got this.",
      timestamp: Date.now(),
    };
  }

  if (words > 30) {
    return {
      id: Date.now().toString(),
      type: isStrict ? 'warning' : 'tip',
      text: isStrict ? "Your answer wandered. Be concise." : "✅ Good elaboration! Now land your point clearly.",
      timestamp: Date.now(),
    };
  }

  if (Math.random() > 0.7) {
    return {
      id: Date.now().toString(),
      type: 'tip',
      text: '✅ Clear and confident. Keep that rhythm.',
      timestamp: Date.now(),
    };
  }

  return null;
}

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const personalityId = (params.id as PersonalityId) || 'nova';
  const personality = PERSONALITIES[personalityId];

  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>('Calm');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | undefined>(undefined);
  const [callStarted, setCallStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  // Prevent double-tap on mobile
  const [isStarting, setIsStarting] = useState(false);

  const {
    callState,
    transcript,
    interimText,
    metrics,
    isInitialized,
    error,
    startCall,
    toggleMute,
    endCall,
  } = useVoiceCall(personalityId, selectedEmotion, selectedScenario);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedTranscriptId = useRef<string | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  // Call timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callStarted && callState !== 'ended') {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStarted, callState]);

  // Generate coaching suggestions from user transcript entries
  useEffect(() => {
    const lastUserEntry = [...transcript].reverse().find(t => t.role === 'user');
    if (lastUserEntry && lastProcessedTranscriptId.current !== lastUserEntry.id) {
      lastProcessedTranscriptId.current = lastUserEntry.id;
      const suggestion = generateCoachSuggestion(lastUserEntry.text, personalityId, metrics);
      if (suggestion) {
        setSuggestions(prev => [suggestion, ...prev].slice(0, 12));
      }
    }
  }, [transcript, personalityId, metrics]);

  /**
   * handleStart is the single user-gesture entry point.
   *
   * Android Chrome's autoplay policy requires that ANY audio (TTS) is
   * triggered synchronously within a user gesture handler. We must call
   * browserTTS.unlock() HERE — before any async work — so the browser
   * registers this as a user-initiated audio action.
   *
   * startCall() (inside useVoiceCall) also calls unlock() for safety,
   * but this page-level call is the definitive one because it is the
   * shallowest call in the synchronous gesture stack.
   */
  const handleStart = useCallback(() => {
    if (isStarting || !isInitialized) return;
    setIsStarting(true);

    // *** CRITICAL for Android: unlock TTS synchronously inside the gesture ***
    elevenLabsTTS.unlock();

    setCallStarted(true);
    startCall();

    // Release the lock after 3 s (prevents double-tap on slow devices)
    setTimeout(() => setIsStarting(false), 3000);
  }, [startCall, isStarting, isInitialized]);

  const handleEnd = useCallback(() => {
    endCall(metrics);
    router.push('/dashboard');
  }, [endCall, router, metrics]);

  if (!personality) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Personality not found.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden gap-0">
      {/* LEFT: Conversation Sidebar */}
      <VoiceSidebar currentPersonalityId={personalityId} />

      {/* CENTER: Main Voice Area */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Ambient background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${personality.color}, transparent 70%)` }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/30 bg-background/30 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              {callStarted && callState !== 'ended' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
              )}
              <span className={cn('text-xs font-bold uppercase tracking-widest', STATE_COLORS[callState])}>
                {STATE_LABELS[callState]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{personality.name}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{personality.role}</span>
            </div>
          </div>

          <span className="font-mono text-sm font-medium bg-secondary/60 border border-border/40 px-3 py-1 rounded-full">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Orb + Transcript area */}
        <div className="flex-1 flex flex-col items-center justify-between overflow-hidden px-4 py-6">
          {/* Voice Orb */}
          <div className="flex flex-col items-center gap-4">
            <VoiceOrb
              isSpeaking={callState === 'speaking'}
              isListening={callState === 'listening'}
              isThinking={callState === 'thinking'}
              color={personality.color}
            />

            {/* State indicator + emotion badge */}
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ borderColor: `${personality.color}55`, color: personality.color, backgroundColor: `${personality.color}15` }}
              >
                {personality.avatar} {personality.name}
              </span>
              {callStarted && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/60 border border-border/40 text-muted-foreground">
                  {selectedEmotion}
                </span>
              )}
            </div>
          </div>

          {/* Live transcript / Pre-call setup */}
          <div className="w-full max-w-lg mt-6 flex-1 min-h-0 flex flex-col">
            {!callStarted ? (
              /* Pre-call setup: Scenario + Emotion */
              <div className="flex-1 flex flex-col items-center justify-center space-y-5 w-full max-w-sm mx-auto">
                {/* Scenario selector */}
                <div className="w-full space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Practice Scenario</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedScenario(undefined)}
                      className={cn(
                        'px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center',
                        selectedScenario === undefined
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/40'
                      )}
                    >
                      Free Conversation
                    </button>
                    {Object.values(SCENARIOS).map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedScenario(s.id)}
                        className={cn(
                          'px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center',
                          selectedScenario === s.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full border-t border-border/30" />

                {/* Emotion selector */}
                <div className="w-full space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Coach Emotion</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {EMOTIONS.map(e => (
                      <button
                        key={e}
                        onClick={() => setSelectedEmotion(e)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                          selectedEmotion === e
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start / Error */}
                {error ? (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-6 py-4 rounded-xl max-w-md text-center flex flex-col gap-3">
                    <p className="font-semibold">Microphone or Speech Engine Error</p>
                    <p>{error}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2 text-foreground">
                      Reload Page &amp; Try Again
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="h-14 px-10 rounded-2xl shadow-xl gap-3 font-bold text-base w-full"
                    style={{ backgroundColor: personality.color, color: 'white' }}
                    onClick={handleStart}
                    disabled={!isInitialized || isStarting}
                  >
                    <Radio className="w-5 h-5" />
                    {isStarting ? 'Starting…' : 'Start Voice Call'}
                    {selectedScenario && (
                      <span className="ml-1 text-xs font-normal opacity-80">· {SCENARIOS[selectedScenario].name}</span>
                    )}
                  </Button>
                )}

                {!isInitialized && !error && (
                  <p className="text-xs text-muted-foreground">Initializing voice engine…</p>
                )}
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-3 py-2">
                  <AnimatePresence initial={false}>
                    {transcript.map(entry => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex',
                          entry.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div className={cn(
                          'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          entry.role === 'user'
                            ? 'bg-primary/15 border border-primary/20 text-foreground rounded-br-sm'
                            : 'bg-secondary/50 border border-border/30 text-foreground/90 rounded-bl-sm'
                        )}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">
                            {entry.role === 'user' ? 'You' : personality.name}
                          </p>
                          {entry.text}
                        </div>
                      </motion.div>
                    ))}

                    {/* Interim / live text */}
                    {interimText && (
                      <motion.div
                        key="interim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end"
                      >
                        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm italic text-muted-foreground bg-secondary/20 border border-dashed border-border/30">
                          {interimText}…
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={transcriptEndRef} />
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        {callStarted && (
          <div className="relative z-10 border-t border-border/30 bg-background/30 backdrop-blur-sm px-4 py-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'h-12 w-12 rounded-full transition-all',
                  callState === 'muted'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    : 'aura-glass'
                )}
                onClick={toggleMute}
              >
                {callState === 'muted' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                size="lg"
                variant="destructive"
                className="h-14 px-10 rounded-2xl font-bold gap-3 shadow-xl"
                onClick={handleEnd}
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </Button>

              <div className={cn(
                'h-12 w-12 rounded-full flex items-center justify-center border',
                callState === 'speaking' ? 'border-primary/40 bg-primary/10' :
                callState === 'thinking' ? 'border-blue-400/40 bg-blue-400/10' :
                'border-border/30 bg-secondary/20'
              )}>
                {callState === 'speaking' && <Volume2 className="h-5 w-5 text-primary" />}
                {callState === 'thinking' && <BrainCircuit className="h-5 w-5 text-blue-400" />}
                {callState === 'listening' && <Mic className="h-5 w-5 text-green-400" />}
                {callState === 'muted' && <CircleStop className="h-5 w-5 text-orange-400" />}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Coach Panel */}
      <div className="w-72 xl:w-80 hidden lg:flex flex-col border-l border-border/40 bg-card/20 backdrop-blur-md">
        <CoachPanel
          suggestions={suggestions}
          metrics={metrics}
          personalityId={personalityId}
        />
      </div>
    </div>
  );
}