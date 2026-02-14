
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '../store/ritualStore';

const LOADING_TEXTS = [
  "Aligning Celestial Coordinates...",
  "Gathering Aether from the Void...",
  "Weaving the Threads of Fate...",
  "Synchronizing Vibration Frequencies...",
  "Inscribing the Sacred Geometry...",
  "Igniting the Spark of Manifestation..."
];

export const RitualLoader: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);
  const intensity = useRitualStore(state => state.intensity);

  useEffect(() => {
    // Preload image
    const img = new Image();
    img.src = "/loading-bg.jpg";

    // Switch text every 2 seconds
    const interval = setInterval(() => {
      setTextIndex(prev => {
          const next = (prev + 1) % LOADING_TEXTS.length;
          return next;
      });
    }, 2500); // Slowed down slightly to 2.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 overflow-hidden pointer-events-auto">
        {/* Background Image Container */}
        <motion.div 
            className="absolute inset-0 z-0"
            style={{ 
                // Opacity linked to ritual intensity (0 to 1)
                opacity: 0.2 + (intensity * 0.8),
                zIndex: -1 
            }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
                opacity: 0.2 + (intensity * 0.8),
                scale: 1 + (intensity * 0.05) // Breathing scale 1.0 -> 1.05
            }}
            transition={{ duration: 0.1 }} // Fast update for smooth intensity tracking
            exit={{ opacity: 0, transition: { duration: 1.0 } }}
        >
            <img 
                src="/loading-bg.jpg" 
                className="w-full h-full object-cover" 
                alt="Ritual Background"
            />
            {/* Overlay gradient to blend with black edges */}
            <div 
                className="absolute inset-0" 
                style={{ background: 'radial-gradient(circle, transparent 20%, #050510 100%)' }}
            />
        </motion.div>

        {/* Text Container (z-10) */}
        <div className="relative z-10 flex flex-col items-center mt-[30vh]"> 
            <AnimatePresence mode="wait">
                <motion.div
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.5 } }}
                className="h-8 flex items-center"
                >
                <TypewriterText text={LOADING_TEXTS[textIndex]} />
                </motion.div>
            </AnimatePresence>
            
            {/* Progress Bar / Energy Line */}
            <div className="w-64 h-[1px] bg-slate-800 mt-4 overflow-hidden relative">
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full h-full"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            </div>
        </div>
    </div>
  );
};

const TypewriterText = ({ text }: { text: string }) => {
    // Simple typewriter effect using CSS steps or just basic string slicing if needed.
    // But since we are fading lines in/out, a static full text with fade is often more elegant for "Ancient" feel.
    // However, user asked for "Smooth Typewriter".
    
    // Let's implement character-by-character stagger
    const characters = text.split("");
    return (
        <span className="font-cinzel text-[#d4af37] tracking-widest text-sm uppercase drop-shadow-[0_0_15px_rgba(212,175,55,0.9)]">
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.05, delay: index * 0.03 }}
                >
                    {char}
                </motion.span>
            ))}
        </span>
    );
}
