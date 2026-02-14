
import React from 'react';
import { motion } from 'framer-motion';
import type { Language } from '../utils/translations';

interface TaoistTalismanProps {
  data: {
    title: string;
    incantation: string;
    symbol: string;
    element: string;
    color: string;
  };
  recipient: string;
  lang: Language;
}

const TaoistTalisman: React.FC<TaoistTalismanProps> = ({ data, recipient, lang }) => {
  const isZh = lang === 'zh';

  return (
    <div className="relative w-[300px] h-[600px] bg-[#f0e6d2] overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.3)] border-4 border-[#8b4513] rounded-sm flex flex-col items-center">
      {/* Paper Texture */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/20 via-transparent to-red-100/20 pointer-events-none"></div>
      
      {/* Border Pattern */}
      <div className="absolute inset-2 border-2 border-double border-red-800/50 rounded-sm pointer-events-none"></div>
      <div className="absolute top-4 bottom-4 left-4 right-4 border border-red-800/30 rounded-sm pointer-events-none"></div>
      
      {/* Mystic Background Runes */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 300 600">
         <path d="M150 50 Q 200 150 150 250 T 150 450" fill="none" stroke="black" strokeWidth="2" />
         <circle cx="150" cy="150" r="100" fill="none" stroke="black" strokeWidth="1" />
         <path d="M50 100 L 250 100" fill="none" stroke="black" strokeWidth="1" strokeDasharray="5,5" />
         <path d="M50 500 L 250 500" fill="none" stroke="black" strokeWidth="1" strokeDasharray="5,5" />
      </svg>

      {/* Talisman Head (The "V" shape often seen) */}
      <div className="mt-6 text-red-600 font-serif font-bold opacity-90 relative z-10">
        <div className="flex flex-col items-center leading-none">
          {/* 符头：敕令 */}
          <span className="text-5xl drop-shadow-sm">敕</span>
          <span className="text-3xl mt-1 drop-shadow-sm">令</span>
          {/* 符胆图腾 */}
          <div className="w-16 h-16 border-2 border-red-600 rounded-full mt-2 flex items-center justify-center relative">
             <div className="absolute w-12 h-12 border border-red-600 rotate-45"></div>
             <div className="text-2xl font-bold">罡</div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 w-full relative flex z-10 p-4">
        
        {/* Central Symbol (The "Magic" part) - Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
           <div className={`text-[180px] ${data.color} blur-[2px]`}>{data.symbol}</div>
        </div>

        {isZh ? (
          // CHINESE LAYOUT (Vertical Traditional)
          <div className="w-full h-full flex flex-row-reverse justify-between items-center px-4">
             {/* Right: Incantation */}
             <div className="h-[80%] writing-vertical-rl text-lg text-red-800 font-serif tracking-widest leading-loose border-l border-red-800/20 pl-2">
               {data.incantation}
             </div>

             {/* Center: Main Title */}
             <div className="h-full writing-vertical-rl flex items-center justify-center">
                <div className="text-5xl font-bold text-black tracking-[0.15em] font-serif drop-shadow-md whitespace-nowrap py-8 bg-gradient-to-b from-black to-slate-800 bg-clip-text text-transparent">
                  {data.title}
                </div>
             </div>

             {/* Left: Info */}
             <div className="h-[60%] writing-vertical-rl text-xs text-slate-600 tracking-widest border-l border-slate-400 pl-2 flex justify-end pb-8">
               <span className="mb-4">{recipient}</span>
               <span>{new Date().getFullYear()}年 • {data.element}</span>
             </div>
          </div>
        ) : (
          // ENGLISH LAYOUT (Horizontal Stacked for readability)
          <div className="w-full h-full flex flex-col items-center justify-start pt-4 gap-6">
            
            {/* Top Info */}
            <div className="text-xs text-slate-600 font-serif tracking-[0.2em] uppercase border-b border-red-800/30 pb-2 w-3/4 text-center">
              {recipient} • {data.element} • {new Date().getFullYear()}
            </div>

            {/* Main Title - Large & Serif */}
            <div className="flex-1 flex items-center justify-center w-full">
               <div className="text-4xl font-bold text-black font-cinzel text-center leading-tight drop-shadow-sm px-2 break-words max-w-full">
                 {data.title}
               </div>
            </div>

            {/* Incantation - Bottom Block */}
            <div className="w-full px-4 pb-12">
               <div className="relative p-4 border border-red-800/30 bg-[#f0e6d2]/50 backdrop-blur-sm rounded-sm">
                 {/* Decorative corners for text block */}
                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-800"></div>
                 <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-800"></div>
                 <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-800"></div>
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-800"></div>
                 
                 <p className="text-sm text-red-900 font-serif text-center italic leading-relaxed font-medium">
                   "{data.incantation}"
                 </p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Red Seal (Stamp) - Positioned at bottom */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-red-600 rounded-lg flex items-center justify-center p-1 opacity-80 mix-blend-multiply rotate-[-5deg] z-20"
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div className="w-full h-full border-2 border-red-600 flex flex-wrap content-center justify-center gap-0.5 text-red-600 font-bold text-[10px] leading-none text-center bg-red-500/10">
          <div className="w-full flex justify-between px-1"><span>天</span><span>运</span></div>
          <div className="w-full flex justify-between px-1"><span>流</span><span>转</span></div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaoistTalisman;
