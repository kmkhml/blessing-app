
import React from 'react';
// import { motion } from 'framer-motion';
import { RitualLoader } from './RitualLoader';
import { useRitualStore } from '../store/ritualStore';

interface RitualOverlayProps {
  onComplete: () => void;
}

const RitualOverlay: React.FC<RitualOverlayProps> = () => {
  const phase = useRitualStore(state => state.phase);
  
  // Only show loader during active ritual phases before completion
  const showLoader = phase === 'charging' || phase === 'release';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none overflow-hidden">
       {showLoader && <RitualLoader />}
    </div>
  );
};

export default RitualOverlay;
