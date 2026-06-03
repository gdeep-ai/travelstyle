import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingNarrativeProps {
  where: string;
  narrative: string;
}

const LoadingNarrative: React.FC<LoadingNarrativeProps> = ({ where, narrative }) => {
  // Split narrative into sentences for staggered animation, keeping the incomplete part at the end
  const sentences = narrative.match(/[^.!?]+[.!?]+/g) || [];
  const remaining = narrative.replace(sentences.join(''), '');
  if (remaining.trim()) {
    sentences.push(remaining);
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-8 border border-neutral-800 bg-neutral-900/50 rounded-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <h3 className="text-sm font-medium text-neutral-400 tracking-widest uppercase">
          Curating Your Story for {where || 'parts unknown'}...
        </h3>
      </div>
      
      <div className="space-y-4 min-h-[200px]">
        <AnimatePresence>
          {sentences.map((msg, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-lg font-serif leading-relaxed ${
                idx === sentences.length - 1 ? 'text-white' : 'text-neutral-500'
              }`}
            >
              {msg.trim()}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoadingNarrative;
