"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { fadeUp, viewportOnce } from "./shared/animations";

export function CTA() {
  return (
    <section className="container mx-auto px-4 py-24 md:px-6 md:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="relative overflow-hidden rounded-[2.5rem] border border-border/60 px-8 py-16 text-center md:px-16 md:py-24"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 92%, black), color-mix(in oklab, var(--accent-2) 85%, black) 55%, color-mix(in oklab, var(--accent) 80%, black))",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_55%)]"
        />
        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl text-balance">
            Start talking today
          </h2>
          <p className="text-base text-white/85 md:text-lg">
            Your first conversation is one tap away — no scripts, no typing, just talk.
          </p>
          <Link href={ROUTES.register}>
            <Button
              size="lg"
              className="group h-13 gap-2 rounded-full bg-white px-8 text-base text-[oklch(0.2_0.02_260)] hover:bg-white/90"
            >
              Start Talking
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
