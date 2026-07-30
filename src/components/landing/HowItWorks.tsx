"use client";

import { motion } from "framer-motion";
import { Mic, Brain, Volume2 } from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import { staggerContainer, fadeUp, viewportOnce } from "./shared/animations";

const STEPS = [
  {
    icon: Mic,
    title: "Speak",
    description: "Talk the moment you open ConverseKey. No typing, no waiting for a text box to load.",
  },
  {
    icon: Brain,
    title: "Think",
    description: "Gemini reasons through what you said while the interface shows it actively listening and processing.",
  },
  {
    icon: Volume2,
    title: "Respond",
    description: "An ElevenLabs voice answers in real time — and stops the instant you start talking again.",
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper
      id="how-it-works"
      eyebrow="The loop"
      title="One conversation, three moments"
      description="Every exchange with ConverseKey moves through the same natural rhythm."
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.15)}
        className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6"
      >
        {/* connecting line */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />

        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            variants={fadeUp}
            className="relative flex flex-col items-center text-center md:items-start md:text-left"
          >
            <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/70 bg-card">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                className="absolute inset-0 rounded-2xl bg-primary/10"
              />
              <step.icon className="relative h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
