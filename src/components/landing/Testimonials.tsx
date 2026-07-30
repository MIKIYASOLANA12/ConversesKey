"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./shared/SectionWrapper";
import { staggerContainer, fadeUp, viewportOnce } from "./shared/animations";

const TESTIMONIALS = [
  {
    quote:
      "I practice Spanish with ConverseKey every morning on my commute. It corrects me mid-sentence the way a real tutor would, not after I've already moved on.",
    name: "Priya Nandakumar",
    role: "Language learner",
  },
  {
    quote:
      "We swapped our support team's FAQ bot for a ConverseKey assistant and resolution time dropped noticeably — people just talk instead of hunting for the right words.",
    name: "Daniel Ferreira",
    role: "Founder, small business",
  },
  {
    quote:
      "The interruption handling is what sold me. I can think out loud and change direction mid-thought, and it actually follows.",
    name: "Wei Zhang",
    role: "Software developer",
  },
  {
    quote:
      "I use it to rehearse difficult conversations before I have them for real. Being able to hear a response, not just read one, changes how I prepare.",
    name: "Amara Okafor",
    role: "Graduate student",
  },
];

export function Testimonials() {
  return (
    <SectionWrapper
      eyebrow="From early users"
      title="Conversations people actually have"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.1)}
        className="columns-1 gap-6 sm:columns-2 lg:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid"
      >
        {TESTIMONIALS.map((t) => (
          <motion.figure
            key={t.name}
            variants={fadeUp}
            className="rounded-2xl border border-border/60 bg-card p-6"
          >
            <blockquote className="text-sm leading-relaxed text-foreground/90 md:text-base">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-xs font-semibold text-foreground">
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.role}</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
