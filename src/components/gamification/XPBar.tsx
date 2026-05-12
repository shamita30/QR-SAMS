import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGamificationStore } from '../../store/useGamificationStore';
import { Zap, Coins, Flame } from 'lucide-react';

interface XPBarProps {
  className?: string;
}

const XPBar: React.FC<XPBarProps> = ({ className = '' }) => {
  const { xp, level, coins, streak, getRank } = useGamificationStore();
  const [xpTarget, setXpTarget] = useState(0);

  const xpForCurrentLevel = Math.pow(level - 1, 2) * 250;
  const xpForNextLevel = Math.pow(level, 2) * 250;
  const currentLevelXP = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const percentage = Math.min(100, Math.max(0, (currentLevelXP / xpNeeded) * 100));
  const rank = getRank();

  useEffect(() => {
    const timer = setTimeout(() => setXpTarget(percentage), 300);
    return () => clearTimeout(timer);
  }, [percentage, xp]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Level Badge */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#ff8243]/20 rounded-full blur-md" />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff8243] to-[#fce883] border border-white/20 flex items-center justify-center relative z-10">
          <span className="font-outfit font-bold text-sm text-white">{level}</span>
        </div>
      </div>
      
      {/* XP Progress */}
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1 font-mono">
            <Zap size={10} className="text-[#fce883]" /> {rank.name}
          </span>
          <span className="text-[10px] font-bold text-[#ff8243] font-mono">{currentLevelXP}/{xpNeeded}</span>
        </div>
        <div className="h-1.5 w-32 md:w-48 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            className="absolute top-0 left-0 h-full xp-bar rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpTarget}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="hidden xl:flex items-center gap-2 ml-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fce883]/10 border border-[#fce883]/20">
          <Coins size={10} className="text-[#fce883]" />
          <span className="text-[9px] font-bold text-[#fce883]">{coins}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ff6b35]/10 border border-[#ff6b35]/20">
          <Flame size={10} className="text-[#ff6b35]" />
          <span className="text-[9px] font-bold text-[#ff6b35]">{streak}</span>
        </div>
      </div>
    </div>
  );
};

export default XPBar;
