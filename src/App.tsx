
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Download } from 'lucide-react';
// import CosmicBackground from './components/CosmicBackground';
import CosmicConvergence from './components/CosmicConvergence';
import RitualOverlay from './components/RitualOverlay';
// import TaoistTalisman from './components/TaoistTalisman';
import { generateBlessing, type BlessingData } from './utils/blessingGenerator';
import { 
  UI_TRANSLATIONS, 
  RECIPIENTS_MAP, 
  BLESSINGS_MAP, 
} from './utils/translations';
import type { Language } from './utils/translations';

// Use English keys as the source of truth for IDs
const RECIPIENT_KEYS = RECIPIENTS_MAP.en;
const BLESSING_KEYS = BLESSINGS_MAP.en;

import { useRitualStore } from './store/ritualStore';

import { generatePoster } from './utils/posterGenerator';

function App() {
  const [lang, setLang] = useState<Language>('en');
  // const [step, setStep] = useState<'input' | 'ritual' | 'result'>('input'); // Replaced by useRitualStore
  const [recipient, setRecipient] = useState<string>(''); 
  const [blessingType, setBlessingType] = useState<string>(''); 
  const [resultData, setResultData] = useState<BlessingData | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const captureRef = useRef<(() => Promise<string>) | null>(null);

  const phase = useRitualStore(state => state.phase);
  const startRitual = useRitualStore(state => state.startRitual);
  const resetRitual = useRitualStore(state => state.resetRitual);
  const t = UI_TRANSLATIONS[lang];
  
  console.log("App Rendering. Phase:", phase);

  // ---------------------------------------------------------------------------
  // WATCHDOG: Force State Recovery
  // If we get stuck in 'release' phase for too long, force 'complete'
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase === 'release') {
        const timer = setTimeout(() => {
            console.warn("🚨 WATCHDOG: Phase stuck in 'release'. Forcing 'complete'.");
            useRitualStore.getState().setPhase('complete');
        }, 2000); // 2s max wait
        return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleStartRitual = () => {
    // If not selected, default to test case
    // TEST OVERRIDE: Force "Self" + "Abundance" if empty for quick testing
    // Or better: Let's find the longest text combination for stress testing.
    // Longest Title: "THE COMPASSIONATE LEADER" (Boss + Love) or "THE SOVEREIGN MANIFEST"
    // Longest Incantation: "My body is a sacred temple. I inhale the healing Aether, restoring balance and vigorous life to every cell." (Self + Health)
    // Let's use "Self" + "Health" to test text scaling.
    
    // Original logic:
    // if (!recipient || !blessingType) return;
    
    // Modified logic for forced preview if empty (Dev Helper)
    let finalRecipient = recipient;
    let finalType = blessingType;
    
    if (!recipient || !blessingType) {
        // Auto-fill with the longest text case for validation
        console.warn("⚠️ AUTO-FILLING FOR STRESS TEST: Self + Health");
        finalRecipient = "Self";
        finalType = "Health";
        setRecipient(finalRecipient);
        setBlessingType(finalType);
    }
    
    // Pass the current language to the generator
    const data = generateBlessing(finalRecipient, finalType, lang);
    setResultData(data);
    
    // Trigger 3D ritual
    startRitual();
  };

  const handleReset = () => {
    resetRitual();
    setRecipient('');
    setBlessingType('');
    setResultData(null);
  };


  const handleDownload = async () => {
      // Old simple download
      if (canvasRef) {
          const link = document.createElement('a');
          link.download = `celestial-blessing-${Date.now()}.png`;
          link.href = canvasRef.toDataURL('image/png');
          link.click();
      }
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (captureRef.current && resultData && !isGenerating) {
        setIsGenerating(true);
        try {
            // 1. Capture High Res 3D Image
            const cardImage = await captureRef.current();
            if (!cardImage) {
                setIsGenerating(false);
                return;
            }

            // 2. Generate Poster
            const posterDataUrl = await generatePoster({
                cardImage,
                data: resultData,
                recipient: getTranslatedRecipient(recipient),
                username: "Seeker" // Fixed for now, can be dynamic
            });

            // 3. Create Link for Download
            // Using "Sacred_Sigil_[User_Name].jpg" format
            // Since we don't have user input name, let's use recipient or generic
            const fileName = `Sacred_Sigil_${recipient}_${blessingType}.jpg`;
            
            const link = document.createElement('a');
            link.download = fileName;
            link.href = posterDataUrl;
            link.click();
            
        } catch (error) {
            console.error("Poster generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  // Helper to get display label for recipient
  const getRecipientLabel = (key: string, index: number) => {
    return lang === 'en' ? key : RECIPIENTS_MAP.zh[index];
  };

  // Helper to get display label for blessing
  const getBlessingLabel = (key: string, index: number) => {
    return lang === 'en' ? key : BLESSINGS_MAP.zh[index];
  };

  // Helper to get display label for selected recipient/blessing in the result view or logic
  // For result view "FOR ...", we want the translated version of the selected key.
  const getTranslatedRecipient = (key: string) => {
    const index = RECIPIENTS_MAP.en.indexOf(key);
    if (index === -1) return key;
    return lang === 'en' ? key : RECIPIENTS_MAP.zh[index];
  };

  // 1. Responsive Camera Rig
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-purple-500/30">
      <CosmicConvergence 
        resultData={resultData} 
        recipient={getTranslatedRecipient(recipient)} 
        onCanvasReady={setCanvasRef}
        captureRef={captureRef}
        cameraZ={isMobile ? 11 : 5} // Drastically further back on mobile for breathing room
      />

      {/* Language Switcher */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-[999] cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-md rounded-full border border-slate-600 hover:bg-slate-700 hover:border-purple-400 transition-all duration-300 group"
      >
        <Globe className="w-4 h-4 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-sm font-cinzel text-slate-300 group-hover:text-white">
          {lang === 'en' ? '中文' : 'English'}
        </span>
      </button>

      <div className="relative z-50 container mx-auto px-4 py-12 md:py-8 flex flex-col justify-start md:justify-center items-center min-h-screen pt-24 md:pt-0">
        <AnimatePresence>
          {phase === 'idle' && (
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
              className="text-2xl md:text-6xl font-cinzel font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-[0.2em]"
            >
              {t.title}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'idle' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.8 } }}
              className="w-full max-w-4xl flex flex-col items-center z-10"
            >
              {/* Floating Layout - No solid container */}
              <div className="flex flex-col w-full items-center relative min-h-[600px] justify-start md:justify-center pt-8 md:pt-0">
                
                {/* Central Light Orb - Deep Cosmic Blue/Gold instead of Pink */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 z-0">
                   <div className={`absolute inset-0 rounded-full blur-[100px] w-64 h-64 md:w-64 md:h-64 scale-40 md:scale-100 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse transition-colors duration-1000
                       bg-blue-950/20 opacity-30
                   `}></div>
                </div>

                {/* 1. Recipient Selection (Dual Orbits) */}
                <div className="w-full flex flex-col items-center z-10 relative mb-12 md:mb-0">
                  <h2 className="text-xl md:text-2xl font-cinzel text-[#D4AF37] mb-8 tracking-[0.2em] uppercase text-center drop-shadow-md">
                    {t.recipientLabel}
                  </h2>
                  
                  {/* Orbit Container - Scaled down on mobile via transform */}
                  <div className="relative w-[300px] h-[300px] md:w-[900px] md:h-[450px] flex justify-center items-center">
                    {(() => {
                        // Split recipients into Inner and Outer
                        const innerSet = new Set(['Self', 'Father', 'Mother', 'Son', 'Daughter', 'Husband', 'Wife', 'Boyfriend', 'Girlfriend']);
                        const innerRecipients = RECIPIENT_KEYS.filter(k => innerSet.has(k));
                        const outerRecipients = RECIPIENT_KEYS.filter(k => !innerSet.has(k));

                        const renderOrbit = (items: string[], radius: number, startAngle: number, endAngle: number, isMobile: boolean) => {
                            return items.map((rKey, index) => {
                                const total = items.length;
                                
                                // Mobile Layout: Simple Flex Grid or smaller orbit
                                if (isMobile) {
                                    return null; // We render mobile differently below
                                }

                                const step = (endAngle - startAngle) / (Math.max(total - 1, 1));
                                const theta = startAngle + index * step;
                                
                                const x = 450 + radius * Math.cos(theta);
                                const y = 380 + radius * Math.sin(theta); // 380 is bottom baseline
                                
                                return (
                                    <button
                                      key={rKey}
                                      onClick={() => setRecipient(rKey)}
                                      style={{
                                          position: 'absolute',
                                          left: x,
                                          top: y,
                                          transform: 'translate(-50%, -50%)'
                                      }}
                                      className={`
                                        relative group px-3 py-1 text-xs font-cinzel tracking-[0.2em] transition-all duration-500
                                        whitespace-nowrap uppercase
                                        ${recipient === rKey 
                                          ? 'text-[#D4AF37] scale-125 z-20 font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] opacity-100' 
                                          : 'text-[#F5F5F0] opacity-60 hover:opacity-100 hover:text-[#D4AF37] hover:scale-110 z-10'
                                        }
                                      `}
                                    >
                                      {/* Text Shake Animation on Hover/Active */}
                                      <span className={`inline-block transition-transform duration-300 ${recipient === rKey ? 'translate-y-[1px]' : 'group-hover:translate-y-[1px]'}`}>
                                         {getRecipientLabel(rKey, index)}
                                      </span>
                                      
                                      {/* Hover/Active Star Ripple (Centripetal Gravity) */}
                                      <div className={`absolute left-1/2 top-full -translate-x-1/2 w-20 h-20 bg-radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%) pointer-events-none transition-opacity duration-500
                                          ${recipient === rKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}
                                      `}></div>
                                    </button>
                                );
                            });
                        };
                        
                        // Desktop Orbit Logic
                        if (!isMobile) {
                             return (
                                <>
                                    {renderOrbit(innerRecipients, 360, 200 * (Math.PI/180), 340 * (Math.PI/180), false)}
                                    {renderOrbit(outerRecipients, 530, 190 * (Math.PI/180), 350 * (Math.PI/180), false)}
                                </>
                            );
                        }

                        // Mobile: Capsule Grid Layout (Obsidian Glass Style)
                        return (
                            <div className="flex flex-wrap justify-center gap-3 w-full px-4">
                                {RECIPIENT_KEYS.map((rKey, index) => (
                                    <button
                                      key={rKey}
                                      onClick={() => setRecipient(rKey)}
                                      className={`
                                        px-4 py-2 rounded-full border text-xs font-cinzel tracking-widest transition-all duration-300 backdrop-blur-md
                                        ${recipient === rKey
                                            ? 'bg-black/90 border-[#ffd700] text-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-105'
                                            : 'bg-black/70 border-white/10 text-white hover:bg-black/90 hover:border-[#ffd700] hover:text-[#ffd700]'
                                        }
                                      `}
                                    >
                                        {getRecipientLabel(rKey, index)}
                                    </button>
                                ))}
                            </div>
                        );
                    })()}
                  </div>
                </div>

                {/* 2. Blessing Selection (Lower Block) */}
                <div className="w-full flex flex-col items-center z-10 mt-8 md:-mt-10">
                  <h2 className="text-xl md:text-2xl font-cinzel text-[#D4AF37] mb-6 tracking-[0.3em] uppercase text-center drop-shadow-md">
                    {t.blessingLabel}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4 max-w-sm md:max-w-3xl px-4">
                    {BLESSING_KEYS.map((bKey, index) => (
                      <button
                        key={bKey}
                        onClick={() => setBlessingType(bKey)}
                        className={`
                          relative group px-6 py-3 rounded-full text-xs font-cinzel tracking-widest transition-all duration-300
                          border backdrop-blur-md
                          ${blessingType === bKey
                            ? 'bg-black/90 text-[#ffd700] border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-105'
                            : 'bg-black/70 text-white border-white/10 hover:bg-black/90 hover:text-[#ffd700] hover:border-[#ffd700]'
                          }
                        `}
                      >
                         <span className="relative z-10">{getBlessingLabel(bKey, index)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Invoke Button with Sacred Geometry Ring */}
                <div className="pt-4">
                  <div className="relative group">
                    {/* Rotating Sacred Geometry Ring */}
                    <div className="absolute -inset-16 border-[1px] border-[#D4AF37]/20 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#D4AF37]/50 rounded-full box-shadow-[0_0_10px_#D4AF37]"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#D4AF37]/50 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#D4AF37]/50 rounded-full"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#D4AF37]/50 rounded-full"></div>
                    </div>
                    <div className="absolute -inset-12 border-[1px] border-[#D4AF37]/10 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none"></div>

                    <button
                      disabled={!recipient || !blessingType}
                      onClick={handleStartRitual}
                      className={`
                        relative w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center
                        transition-all duration-700
                        ${recipient && blessingType 
                           ? 'bg-black/40 backdrop-blur-md hover:bg-black/60 hover:scale-110 hover:border-[#D4AF37] cursor-pointer shadow-[0_0_40px_rgba(212,175,55,0.3)]' 
                           : 'bg-transparent opacity-30 cursor-not-allowed grayscale'
                        }
                      `}
                    >
                        {/* Inner Ring */}
                        <div className="absolute inset-2 rounded-full border border-[#D4AF37]/20 group-hover:rotate-180 transition-transform duration-[3s]"></div>
                        
                        {/* Icon/Text */}
                        <span className={`font-cinzel text-2xl text-[#D4AF37] drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]`}>
                           ✦
                        </span>
                        
                        <span className="absolute -bottom-10 text-[10px] font-cinzel tracking-[0.3em] text-[#D4AF37]/70 uppercase whitespace-nowrap">
                          {t.invokeButton}
                        </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === 'charging' || phase === 'release') && (
            <RitualOverlay onComplete={() => {}} />
        )}

        <AnimatePresence>
          {phase === 'complete' && resultData && (
             // No DOM elements for the result card. 
             // The 3D card will be rendered inside CosmicConvergence or a new overlay canvas.
             // We just provide the "Close" button here.
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }} // Reduced delay significantly
              className="fixed bottom-10 left-0 right-0 flex justify-center z-[100] pointer-events-auto px-4" // Fixed positioning and max Z
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center w-full max-w-md md:max-w-none">
                
                {/* CLAIM & SHARE Button (Primary) */}
                <div className="relative group w-full md:w-auto">
                    {/* Animated Gradient Border */}
                    <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-500/0 via-amber-400/70 to-amber-500/0 opacity-70 group-hover:opacity-100 blur-[1px] transition-all duration-500"></div>
                    
                    <button
                      onClick={handleShare}
                      className="relative w-full md:w-auto justify-center px-8 py-3 rounded-full bg-[#ffd700] hover:bg-[#e6c200] text-black font-bold border border-amber-400 transition-all duration-300 text-sm font-cinzel tracking-[0.15em] flex items-center gap-3 overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)]"
                    >
                      {/* Internal Sheen */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      
                      <Globe className={`w-4 h-4 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
                      {isGenerating ? 'GENERATING...' : (lang === 'en' ? 'CLAIM & SHARE SIGIL' : '领取并分享印记')}
                    </button>
                </div>

                {/* Action Group (Download + Reset) */}
                <div className="flex gap-4 w-full md:w-auto justify-center">
                    {/* Local Download (Secondary) */}
                    <button
                      onClick={handleDownload}
                      className="p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur text-slate-400 hover:text-white hover:border-white/30 transition-all group"
                      title="Save Image Only"
                    >
                       <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
    
                    {/* Reset */}
                    <button
                      onClick={handleReset}
                      className="flex-1 md:flex-none px-6 py-2 rounded-full border border-slate-600/50 bg-black/40 backdrop-blur text-slate-400 hover:text-white hover:border-slate-400 transition-all text-xs font-cinzel tracking-widest uppercase"
                    >
                      {t.resetButton}
                    </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
