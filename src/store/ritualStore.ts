import { create } from 'zustand';

export type RitualPhase = 'idle' | 'charging' | 'release' | 'cooldown' | 'complete';

interface RitualState {
  phase: RitualPhase;
  intensity: number; // 0 to 1
  setPhase: (phase: RitualPhase) => void;
  setIntensity: (intensity: number) => void;
  startRitual: () => void;
  resetRitual: () => void;
}

export const useRitualStore = create<RitualState>((set, get) => ({
  phase: 'idle',
  intensity: 0,
  setPhase: (phase) => set({ phase }),
  setIntensity: (intensity) => set({ intensity }),
  startRitual: () => {
    set({ phase: 'charging', intensity: 0 });
    
    // Simulate the ritual timeline
    // Phase 1: Charging (0s - 3s)
    let progress = 0;
    const duration = 3000; // 3 seconds minimum
    const stepTime = 50; // SLOWED DOWN from 30ms to 50ms to reduce render pressure
    const steps = duration / stepTime;
    const increment = 1 / steps;

    // Clear any existing interval just in case
    // (In a real store, we might need a ref to the interval ID, but Zustand is simple)
    
    const interval = setInterval(() => {
      // Use get() to check current state, ensure we don't run if reset
      if (get().phase !== 'charging') {
          clearInterval(interval);
          return;
      }

      progress += increment;
      if (progress >= 1) {
        clearInterval(interval);
        
        // Phase 2: Release / Climax (3s mark)
        console.log("Store: Entering Release Phase");
        set({ phase: 'release', intensity: 1 });
        
        // Wait for White Flash (0.8s)
        setTimeout(() => {
          // Phase 3: Cooldown / Reveal (3.8s mark)
          console.log("Store: Entering Complete Phase");
          set({ phase: 'complete', intensity: 0 });
        }, 1200); // Increased slightly to 1.2s to ensure flash completes
        
      } else {
        set({ intensity: progress });
      }
    }, stepTime);
  },
  resetRitual: () => {
    set({ phase: 'idle', intensity: 0 });
  }
}));
