"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { VoiceOrb } from "./shared/VoiceOrb";
import { EASE_OUT, staggerContainer, fadeUp } from "./shared/animations";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 20 });
  const springY = useSpring(my, { stiffness: 60, damping: 20 });
  const glowX = useTransform(springX, (v) => `${50 + v * 8}%`);
  const glowY = useTransform(springY, (v) => `${50 + v * 8}%`);
  const orbRotate = useTransform(springX, (v) => v * 4);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-16"
    >
      {/* Ambient background gradients */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: useMotionTemplate`radial-gradient(600px circle at ${glowX} ${glowY}, color-mix(in oklab, var(--primary) 22%, transparent), transparent 60%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-20 h-[560px] w-[860px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "linear-gradient(120deg, var(--primary), var(--accent-2, var(--primary)) 45%, var(--accent))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_0)] [background-size:34px_34px]"
      />

      <motion.div
        variants={staggerContainer(0.14, 0.1)}
        initial="hidden"
        animate="visible"
        className="container relative z-10 mx-auto flex flex-col items-center gap-8 px-4 text-center md:px-6"
      >
        <motion.span
          variants={fadeUp}
          className="aura-glass inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Now speaking with Gemini intelligence
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-display max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl"
        >
          The future of{" "}
          <span className="bg-gradient-to-r from-primary via-[var(--accent-2)] to-accent bg-clip-text text-transparent">
            human-AI conversation
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          ConverseKey lets you talk with intelligent AI companions in real time —
          interrupt them mid-thought, hear them think, and pick up exactly where the conversation left off.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row">
          <Link href={ROUTES.register}>
            <Button
              size="lg"
              className="group h-13 gap-2 rounded-full bg-primary px-8 text-base text-primary-foreground shadow-[0_0_40px_-8px_var(--primary)] transition-transform hover:scale-[1.03] hover:bg-primary/90"
            >
              Start Talking
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#demo">
            <Button
              size="lg"
              variant="outline"
              className="h-13 gap-2 rounded-full border-border/80 px-8 text-base backdrop-blur hover:bg-secondary"
            >
              <PlayCircle className="h-4 w-4" />
              Watch Demo
            </Button>
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ rotate: orbRotate }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
        className="relative z-0 mt-6 hidden sm:block md:mt-2"
      >
        <VoiceOrb size={380} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground sm:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-[1px] bg-gradient-to-b from-muted-foreground to-transparent"
        />
      </motion.div>
    </div>
  );
}
