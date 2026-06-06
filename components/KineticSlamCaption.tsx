import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface KineticSlamCaptionProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

const slamEntrances = [
  { x: 0, y: -80, scale: 0.95, rotate: -3 },
  { x: -160, y: 0, scale: 0.98, rotate: -1 },
  { x: 160, y: 0, scale: 0.98, rotate: 1 },
  { x: 0, y: 80, scale: 0.72, rotate: 3 },
];

const KineticSlamCaption: React.FC<KineticSlamCaptionProps> = ({
  words,
  intervalMs = 950,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const slamWords = useMemo(() => (
    words
      .map((word) => word.trim())
      .filter(Boolean)
      .slice(0, 8)
  ), [words]);

  useEffect(() => {
    if (prefersReducedMotion || slamWords.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slamWords.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, prefersReducedMotion, slamWords.length]);

  if (slamWords.length === 0) return null;

  const activeWord = slamWords[activeIndex % slamWords.length];
  const entrance = slamEntrances[activeIndex % slamEntrances.length];

  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`} aria-label={slamWords.join(' ')}>
        {slamWords.slice(0, 4).map((word) => (
          <span key={word} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.28em] text-white/70">
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative isolate h-28 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 ${className}`} aria-label={activeWord}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_75%_70%,rgba(255,255,255,0.09),transparent_28%)]" />
      <div className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-white/10" />
      <AnimatePresence mode="wait">
        <motion.span
          key={`${activeWord}-${activeIndex}`}
          initial={{ ...entrance, opacity: 0, filter: 'blur(10px)' }}
          animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.18, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 430, damping: 28, mass: 0.65 }}
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-5xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl"
        >
          {activeWord}
        </motion.span>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
};

export default KineticSlamCaption;
