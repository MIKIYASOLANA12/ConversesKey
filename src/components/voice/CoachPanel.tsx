'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Flame, Info, TrendingUp, Activity, Timer, Mic2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveMetrics } from '@/lib/hooks/use-voice-call';

export interface Suggestion {
  id: string;
  text: string;
  type: 'tip' | 'warning' | 'roast' | 'info';
  timestamp: number;
}

interface CoachPanelProps {
  suggestions: Suggestion[];
  metrics: LiveMetrics;
  personalityId: string;
}

function MetricGauge({ label, value, max, color, icon: Icon }: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="w-3 h-3" />
          <span className="uppercase tracking-widest font-bold">{label}</span>
        </div>
        <span className="font-mono text-xs font-bold">{value}{label === 'Pace' ? ' wpm' : '%'}</span>
      </div>
      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function CoachPanel({ suggestions, metrics, personalityId }: CoachPanelProps) {
  const isRoaster = personalityId === 'echo';

  return (
    <div className="flex flex-col h-full aura-glass rounded-2xl border-border/40 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border/40 bg-secondary/20 flex items-center gap-2">
        {isRoaster ? (
          <Flame className="h-4 w-4 text-orange-400" />
        ) : (
          <Zap className="h-4 w-4 text-primary" />
        )}
        <h3 className="font-bold text-sm uppercase tracking-widest">
          {isRoaster ? 'Roast Panel' : 'Live Coach'}
        </h3>
      </div>

      {/* Live Metrics */}
      <div className="p-4 border-b border-border/30 space-y-3 bg-secondary/10">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Live Metrics</p>
        <MetricGauge label="Confidence" value={metrics.confidence} max={100} color="oklch(0.65 0.22 260)" icon={TrendingUp} />
        <MetricGauge label="Energy" value={metrics.energy} max={100} color="oklch(0.70 0.20 150)" icon={Activity} />
        <MetricGauge label="Pace" value={metrics.pace} max={200} color="oklch(0.65 0.18 30)" icon={Timer} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mic2 className="w-3 h-3" />
            <span className="uppercase tracking-widest font-bold">Fillers</span>
          </div>
          <span className={cn(
            'font-mono text-xs font-bold',
            metrics.fillerWords > 5 ? 'text-destructive' : metrics.fillerWords > 2 ? 'text-orange-400' : 'text-green-400'
          )}>
            {metrics.fillerWords} detected
          </span>
        </div>
      </div>

      {/* Suggestions Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">Suggestions</p>
        <AnimatePresence initial={false}>
          {suggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center pt-8 text-center space-y-2 opacity-40"
            >
              <Sparkles className="h-7 w-7" />
              <p className="text-xs">Start talking to receive live coaching...</p>
            </motion.div>
          ) : (
            suggestions.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 16, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className={cn(
                  'p-3 rounded-xl text-xs font-medium border leading-relaxed',
                  s.type === 'roast' && 'bg-orange-500/10 border-orange-500/20 text-orange-300',
                  s.type === 'warning' && 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
                  s.type === 'tip' && 'bg-primary/10 border-primary/20 text-primary',
                  s.type === 'info' && 'bg-secondary/50 border-border/50 text-foreground/80'
                )}
              >
                {s.text}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-2.5 bg-secondary/10 text-[10px] text-muted-foreground flex items-center gap-1.5 px-4 border-t border-border/30">
        <Info className="h-3 w-3 shrink-0" />
        <span>Coaching updates as you speak</span>
      </div>
    </div>
  );
}
