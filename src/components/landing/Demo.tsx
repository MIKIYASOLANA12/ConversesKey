"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import { fadeUp, viewportOnce } from "./shared/animations";

const TRANSCRIPT = [
  { speaker: "you", text: "Can you help me practice for a job interview in French?" },
  { speaker: "ai", text: "Of course — let's start with 'Parlez-moi de vous.' Take your time." },
];

function Waveform({ active }: { active: boolean }) {
  const bars = Array.from({ length: 40 });
  return (
    <div className="flex h-16 items-center gap-[3px]">
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-primary via-[var(--accent-2)] to-accent"
          animate={{
            height: active
              ? [8, 10 + Math.abs(Math.sin(i)) * 46, 8]
              : [6, 6 + (i % 3) * 3, 6],
          }}
          transition={{
            duration: active ? 0.7 + (i % 5) * 0.05 : 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.025,
          }}
        />
      ))}
    </div>
  );
}

export function Demo() {
  const [state, setState] = useState<"listening" | "speaking">("listening");
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((s) => (s === "listening" ? "speaking" : "listening"));
      setVisibleLines((v) => Math.min(v + 1, TRANSCRIPT.length));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper
      id="demo"
      eyebrow="See it live"
      title="A conversation, not a chat log"
      description="This is a preview of what talking to ConverseKey actually feels like."
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-card aura-shadow-lg"
      >
        <div className="flex items-center gap-2 border-b border-border/70 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.15_85)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">
            conversekey.app — live session
          </span>
        </div>

        <div className="flex flex-col gap-8 p-6 md:p-10">
          <div className="flex flex-col items-center gap-3">
            <Waveform active={state === "speaking"} />
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Mic className="h-3.5 w-3.5" />
              {state === "speaking" ? "AI is speaking" : "Listening"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {TRANSCRIPT.slice(0, visibleLines || 1).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`flex ${line.speaker === "you" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    line.speaker === "you"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {line.text}
                </div>
              </motion.div>
            ))}
            {visibleLines === 0 && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl bg-secondary px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
