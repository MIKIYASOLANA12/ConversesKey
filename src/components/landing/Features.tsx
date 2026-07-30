"use client";

import { motion } from "framer-motion";
import {
  AudioLines,
  Users,
  Hand,
  Zap,
  Smartphone,
  ShieldCheck,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import { staggerContainer, fadeUp, viewportOnce } from "./shared/animations";

const FEATURES = [
  {
    icon: AudioLines,
    title: "Real-time voice",
    description: "Speak naturally and hear responses stream back with near-zero latency.",
  },
  {
    icon: Users,
    title: "AI personalities",
    description: "Switch between distinct companions, each with its own voice and tone.",
  },
  {
    icon: Hand,
    title: "Interrupt naturally",
    description: "Cut in mid-response the way you would in a real conversation.",
  },
  {
    icon: Zap,
    title: "Fast responses",
    description: "Built on Gemini for reasoning that keeps pace with how you actually talk.",
  },
  {
    icon: Smartphone,
    title: "Mobile friendly",
    description: "Carry a conversation from your desktop to your phone without losing context.",
  },
  {
    icon: ShieldCheck,
    title: "Secure conversations",
    description: "Every session is encrypted end to end, so what you say stays yours.",
  },
  {
    icon: Sparkles,
    title: "Custom voices",
    description: "Bring an ElevenLabs voice of your choosing to any assistant you build.",
  },
  {
    icon: LayoutDashboard,
    title: "Modern dashboard",
    description: "Review past conversations, organize projects, and pick up where you left off.",
  },
];

export function Features() {
  return (
    <SectionWrapper
      id="features"
      eyebrow="Capabilities"
      title="Everything a conversation needs"
      description="Not a chatbot with a microphone bolted on — a platform built around the rhythm of real speech."
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeUp}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0"
            />
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
              <feature.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mb-2 font-display text-base font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
