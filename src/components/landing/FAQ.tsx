"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionWrapper } from "./shared/SectionWrapper";
import { fadeUp, viewportOnce } from "./shared/animations";

const FAQS = [
  {
    question: "How is ConverseKey different from a normal AI chatbot?",
    answer:
      "ConverseKey is built around voice, not text. You talk instead of type, you can interrupt the AI mid-response the way you would in a real conversation, and responses come back through natural, expressive speech.",
  },
  {
    question: "Which AI models and voices power it?",
    answer:
      "Conversations are reasoned through Google's Gemini and spoken using ElevenLabs voices, giving you both fast, capable thinking and natural-sounding speech.",
  },
  {
    question: "Can I create a custom AI assistant?",
    answer:
      "Yes. You can define a custom personality, choose or clone a voice, and shape how that assistant responds — useful for coaching, tutoring, or a dedicated work companion.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "ConverseKey is built mobile-first, so a conversation you start on desktop continues seamlessly on your phone.",
  },
  {
    question: "Is my conversation data private?",
    answer:
      "Every session is encrypted end to end. Your conversations are yours — we don't use them to train models without explicit consent.",
  },
  {
    question: "Will ConverseKey support other languages?",
    answer:
      "Multilingual conversation is on our roadmap, so you'll be able to speak and be understood in more than English soon.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border/60">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-base font-medium text-foreground md:text-lg">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm leading-relaxed text-muted-foreground md:text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionWrapper
      id="faq"
      eyebrow="Questions"
      title="Frequently asked questions"
      align="left"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto max-w-3xl"
      >
        {FAQS.map((faq, i) => (
          <FAQItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
