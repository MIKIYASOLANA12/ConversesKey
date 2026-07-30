"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./shared/SectionWrapper";
import { fadeUp, viewportOnce } from "./shared/animations";

export function Founder() {
  return (
    <SectionWrapper eyebrow="Who's building this" title="About the founder">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-3xl border border-border/70 bg-card p-8 text-center md:p-10"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-[var(--accent-2)] to-accent font-display text-xl font-semibold text-primary-foreground">
          MO
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Mikiyas Olana
          </h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Founder, age 17
          </p>
        </div>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
          Mikiyas built ConverseKey to make AI feel less like software and more like
          talking to someone who actually listens — a platform designed to put
          natural conversation, not typing, at the center of how people use AI.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
