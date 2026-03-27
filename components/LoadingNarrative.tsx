import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { streamLoadingNarrative } from '../services/geminiService';

interface LoadingNarrativeProps {
  where: string;
  style: string;
  attire: string;
  who: string;
  vibe: string;
  tone: number;
}

const LoadingNarrative: React.FC<LoadingNarrativeProps> = ({ where, style, attire, who, vibe, tone }) => {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStream = async () => {
      try {
        setVisibleMessages([`Consulting the archives for your journey to ${where || 'parts unknown'}...`]);
        const stream = streamLoadingNarrative(who, attire, where, style, vibe, tone);
        for await (const sentence of stream) {
          if (!isMounted) break;
          setVisibleMessages(prev => [...prev, sentence]);
          // Add a small artificial delay to make it feel like it's being written
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (err) {
        console.error("Error streaming narrative:", err);
      }
    };

    fetchStream();

    return () => {
      isMounted = false;
    };
  }, [where, style, attire, who, vibe, tone]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-8 border border-neutral-800 bg-neutral-900/50 rounded-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <h3 className="text-sm font-medium text-neutral-400 tracking-widest uppercase">
          Curating Your Story
        </h3>
      </div>
      
      <div className="space-y-4 min-h-[200px]">
        <AnimatePresence>
          {visibleMessages.map((msg, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-lg font-serif leading-relaxed ${
                idx === visibleMessages.length - 1 ? 'text-white' : 'text-neutral-500'
              }`}
            >
              {msg}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoadingNarrative;
