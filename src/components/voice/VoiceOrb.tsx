'use client';

import { motion } from 'framer-motion';

interface VoiceOrbProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  color: string;
}

export function VoiceOrb({ isSpeaking, isListening, isThinking, color }: VoiceOrbProps) {
  const isActive = isSpeaking || isListening || isThinking;

  return (
    <div className="relative flex items-center justify-center w-56 h-56 md:w-72 md:h-72">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.25, 1] : 1,
          opacity: isSpeaking ? [0.3, 0.55, 0.3] : isListening ? [0.15, 0.3, 0.15] : 0.08,
        }}
        transition={{ duration: isSpeaking ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ backgroundColor: color }}
      />

      {/* Thinking Spinner */}
      {isThinking && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-t-transparent"
          style={{ borderColor: `${color}55`, borderTopColor: color }}
        />
      )}

      {/* Main Orb */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.08, 0.97, 1.05, 1] : isListening ? [1, 1.03, 1] : 1,
          borderRadius: isSpeaking
            ? ['45% 55% 60% 40% / 45% 50% 55% 50%', '60% 40% 35% 65% / 55% 60% 45% 60%', '45% 55% 60% 40% / 45% 50% 55% 50%']
            : ['50%', '50%'],
        }}
        transition={{
          duration: isSpeaking ? 0.45 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full shadow-2xl flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 80px ${color}33, 0 0 160px ${color}11`,
        }}
      >
        {/* Glass Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/5 to-transparent pointer-events-none" />

        {/* Speaking Waveform Bars */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 px-10">
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [6, Math.random() * 70 + 16, 6] }}
                transition={{
                  duration: 0.18 + Math.random() * 0.12,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: 'easeInOut',
                }}
                className="flex-1 rounded-full bg-white/50"
              />
            ))}
          </div>
        )}

        {/* Listening Pulse Dot */}
        {isListening && !isSpeaking && (
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-5 rounded-full bg-white/70"
            />
          </div>
        )}

        {/* Thinking Dots */}
        {isThinking && (
          <div className="flex items-center gap-2">
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.7, repeat: Infinity, delay, ease: 'easeInOut' }}
                className="w-3 h-3 rounded-full bg-white/70"
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Outer Pulse Rings */}
      {isActive && (
        <>
          <motion.div
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.55, opacity: 0 }}
            transition={{ duration: isSpeaking ? 1.2 : 2.2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border pointer-events-none"
            style={{ borderColor: color }}
          />
          <motion.div
            initial={{ scale: 1, opacity: 0.25 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: isSpeaking ? 1.2 : 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            className="absolute inset-0 rounded-full border pointer-events-none"
            style={{ borderColor: color }}
          />
        </>
      )}
    </div>
  );
}
