"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * VoiceOrb — the page's signature element.
 * A core sphere ringed by a live waveform that alternates between
 * "listening" (tight, quiet bars) and "speaking" (tall, active bars),
 * mirroring the actual state machine of a ConverseKey conversation.
 */

const BAR_COUNT = 28;

function useConversationState() {
  const [state, setState] = useState<"listening" | "thinking" | "speaking">("listening");

  useEffect(() => {
    const sequence: Array<"listening" | "thinking" | "speaking"> = [
      "listening",
      "thinking",
      "speaking",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % sequence.length;
      setState(sequence[i]);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return state;
}

export function VoiceOrb({ size = 420 }: { size?: number }) {
  const state = useConversationState();

  const bars = Array.from({ length: BAR_COUNT });
  const radius = size * 0.32;
  const center = size / 2;

  const amplitudeFor = (index: number) => {
    const base = Math.sin((index / BAR_COUNT) * Math.PI * 4) * 0.5 + 0.5;
    if (state === "listening") return 0.15 + base * 0.15;
    if (state === "thinking") return 0.1 + Math.abs(Math.sin(index * 13)) * 0.08;
    return 0.35 + base * 0.55;
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated visualization of a live AI voice conversation"
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 55%, transparent) 0%, transparent 70%)",
        }}
        animate={{
          opacity: state === "speaking" ? [0.5, 0.85, 0.5] : [0.3, 0.45, 0.3],
          scale: state === "speaking" ? [1, 1.08, 1] : [1, 1.02, 1],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating ring of waveform bars */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="orb-bar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="55%" stopColor="var(--accent-2, var(--primary))" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        {bars.map((_, i) => {
          const angle = (i / BAR_COUNT) * Math.PI * 2;
          const amp = amplitudeFor(i);
          const barLength = radius * 0.55 * amp + 8;
          const x1 = center + Math.cos(angle) * radius;
          const y1 = center + Math.sin(angle) * radius;
          const x2 = center + Math.cos(angle) * (radius + barLength);
          const y2 = center + Math.sin(angle) * (radius + barLength);

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#orb-bar-gradient)"
              strokeWidth={size * 0.008}
              strokeLinecap="round"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{
                duration: state === "speaking" ? 0.9 : 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.03,
              }}
            />
          );
        })}
      </svg>

      {/* Core sphere */}
      <motion.div
        className="relative z-10 flex items-center justify-center rounded-full aura-shadow-lg"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          background:
            "linear-gradient(145deg, color-mix(in oklab, var(--primary) 90%, white 10%), var(--accent-2, var(--primary)) 60%, var(--accent))",
        }}
        animate={{
          scale: state === "speaking" ? [1, 1.05, 1] : [1, 1.015, 1],
        }}
        transition={{ duration: state === "speaking" ? 0.9 : 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-2 rounded-full bg-background/10 backdrop-blur-sm" />
        <span className="relative z-10 font-mono text-[11px] uppercase tracking-[0.25em] text-primary-foreground/90">
          {state}
        </span>
      </motion.div>
    </div>
  );
}
