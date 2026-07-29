'use client';

import { motion } from 'framer-motion';
import { Activity, BarChart2, Mic2, Timer } from 'lucide-react';

export interface ConversationMetrics {
  confidence: number; // 0-100
  clarity: number; // 0-100
  pace: number; // words per minute
  fillerWords: number;
}

interface MetricsBarProps {
  metrics: ConversationMetrics;
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-3 aura-glass rounded-2xl border-border/30 shadow-xl">
      <MetricItem 
        label="Confidence" 
        value={metrics.confidence} 
        unit="%" 
        icon={Mic2} 
        color="oklch(0.65 0.22 260)" 
      />
      <div className="h-8 w-px bg-border/40 hidden sm:block" />
      <MetricItem 
        label="Clarity" 
        value={metrics.clarity} 
        unit="%" 
        icon={BarChart2} 
        color="oklch(0.70 0.15 150)" 
      />
      <div className="h-8 w-px bg-border/40 hidden sm:block" />
      <MetricItem 
        label="Pace" 
        value={metrics.pace} 
        unit="wpm" 
        icon={Timer} 
        color="oklch(0.60 0.25 30)" 
      />
      <div className="h-8 w-px bg-border/40 hidden sm:block" />
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Fillers</span>
        <div className="flex items-center gap-1.5 font-mono font-bold text-lg">
          <Activity className="h-4 w-4 text-destructive" />
          {metrics.fillerWords}
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, unit, icon: Icon, color }: { 
  label: string; 
  value: number; 
  unit: string; 
  icon: any;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <div className="flex items-baseline gap-0.5">
          <span className="font-mono font-bold text-lg">{Math.round(value)}</span>
          <span className="text-[10px] font-medium text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="mt-1.5 h-1 w-24 bg-secondary rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
