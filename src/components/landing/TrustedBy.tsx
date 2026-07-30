"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp, viewportOnce } from "./shared/animations";

const STACK = [
  { name: "Gemini", detail: "Reasoning engine" },
  { name: "ElevenLabs", detail: "Voice synthesis" },
  { name: "Next.js", detail: "App framework" },
  { name: "Supabase", detail: "Data & auth" },
  { name: "Vercel", detail: "Edge deployment" },
];

export function TrustedBy() {
  return (
    <section className="relative border-y border-border/60 py-14">
      <div className="container mx-auto px-4 md:px-6">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mb-8 text-center font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground"
        >
          Built using
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.08)}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
        >
          {STACK.map((item) => (
            <motion.div
              key={item.name}
              variants={fadeUp}
              className="aura-glass flex items-center gap-2 rounded-full border px-5 py-2.5 transition-colors hover:border-primary/40"
            >
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                · {item.detail}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
