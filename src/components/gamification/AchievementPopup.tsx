import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '../../store/useGamificationStore';
import confetti from 'canvas-confetti';
import { Trophy, Star, Zap } from 'lucide-react';

const AchievementPopup: React.FC = () => {
  const { recentLevelUp, clearLevelUp, level, recentBadge, clearRecentBadge } = useGamificationStore();

  useEffect(() => {
    if (recentLevelUp) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100, colors: ['#ff8243', '#fce883', '#ffc0cb', '#609494', '#00d4ff'] };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      const timer = setTimeout(clearLevelUp, 5000);
      return () => { clearInterval(interval); clearTimeout(timer); };
    }
  }, [recentLevelUp, clearLevelUp]);

  useEffect(() => {
    if (recentBadge) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.3 }, colors: ['#ff8243', '#fce883', '#ffc0cb'] });
      const timer = setTimeout(clearRecentBadge, 4000);
      return () => clearTimeout(timer);
    }
  }, [recentBadge, clearRecentBadge]);

  return (
    <>
      {/* Level Up Popup */}
      <AnimatePresence>
        {recentLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -80 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="relative px-10 py-5 rounded-2xl border border-[#fce883]/40 flex items-center gap-4 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,130,67,0.15), rgba(12,16,32,0.95), rgba(252,232,131,0.1))', boxShadow: '0 0 60px rgba(252,232,131,0.2), inset 0 0 30px rgba(255,130,67,0.05)' }}>
              <div className="absolute inset-0 animate-holographic" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff8243] to-[#fce883] flex items-center justify-center relative z-10 shadow-neon-orange">
                <Trophy size={28} className="text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="font-outfit font-black text-2xl text-white neon-text-orange flex items-center gap-2">
                  LEVEL UP! <Zap size={20} className="text-[#fce883]" />
                </h3>
                <p className="text-sm text-[#fce883] font-bold flex items-center gap-1">
                  You reached Level {level} <Star size={14} className="fill-[#fce883]" />
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Unlock Popup */}
      <AnimatePresence>
        {recentBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-8 py-4 rounded-2xl border border-[#609494]/40 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(96,148,148,0.15), rgba(12,16,32,0.95))', boxShadow: '0 0 40px rgba(96,148,148,0.2)' }}>
              <span className="text-3xl">{recentBadge.icon}</span>
              <div>
                <p className="text-[10px] font-bold text-[#609494] uppercase tracking-widest">Badge Unlocked!</p>
                <h3 className="font-outfit font-bold text-lg text-white">{recentBadge.name}</h3>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementPopup;
