"use client";

import { motion } from "framer-motion";
import { Accessibility, GraduationCap, Globe2, MessagesSquare } from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import { staggerContainer, fadeUp, viewportOnce } from "./shared/animations";

const REASONS = [
  {
    icon: Accessibility,
    title: "Accessibility first",
    description: "Voice removes the friction of typing for anyone who finds a keyboard a barrier, not a tool.",
  },
  {
    icon: GraduationCap,
    title: "Built for learning",
    description: "Practicing a language or a hard conversation out loud teaches differently than reading text ever will.",
  },
  {
    icon: Globe2,
    title: "AI for everyone",
    description: "Every target audience — students to founders — gets the same natural way in, no technical fluency required.",
  },
  {
    icon: MessagesSquare,
    title: "Communication, not commands",
    description: "ConverseKey is designed around dialogue, not prompts — because that's how people actually think out loud.",
  },
];

export function WhyConverseKey() {
  return (
    <SectionWrapper
      eyebrow="Why we're building this"
      title="Talking is still the most human interface"
      description="ConverseKey exists because text boxes were never how we were meant to think out loud."
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.1)}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {REASONS.map((reason) => (
          <motion.div
            key={reason.title}
            variants={fadeUp}
            className="flex gap-4 rounded-2xl border border-border/60 p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
              <reason.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="mb-1.5 font-display text-base font-semibold text-foreground">
                {reason.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {reason.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
