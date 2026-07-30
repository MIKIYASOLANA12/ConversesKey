"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, viewportOnce } from "./animations";

interface SectionWrapperProps {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
  children: React.ReactNode;
}

export function SectionWrapper({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className,
  children,
}: SectionWrapperProps) {
  const isCenter = align === "center";

  return (
    <section id={id} className={cn("relative py-24 md:py-32", className)}>
      <div className="container mx-auto px-4 md:px-6">
        {(eyebrow || title || description) && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            className={cn(
              "mb-14 md:mb-20 flex flex-col gap-4",
              isCenter ? "items-center text-center mx-auto max-w-2xl" : "items-start text-left max-w-2xl"
            )}
          >
            {eyebrow && (
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-balance">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base md:text-lg text-muted-foreground text-balance leading-relaxed">
                {description}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
