import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Terminal } from 'lucide-react';

const IntroScene3D = lazy(() => import('./IntroScene3D'));

const bootLines = [
  '> Initializing Sentinel Protocol v4.0...',
  '> Loading neural network modules...',
  '> Connecting to campus data nodes...',
  '> Verifying authentication pathways...',
  '> Mounting 3D rendering pipeline...',
  '> Calibrating XP gamification engine...',
  '> System ready. Welcome to Sentinel.',
];

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [typedText, setTypedText] = useState('');

  // Progress animation: 0 → 1 over ~4 seconds
  useEffect(() => {
    const duration = 4000;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(onComplete, 800);
        }, 500);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [onComplete]);

  // Boot log lines
  useEffect(() => {
    const lineInterval = 4000 / bootLines.length;
    const timer = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev < bootLines.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, lineInterval);
    return () => clearInterval(timer);
  }, []);

  // Typewriter effect for current line
  useEffect(() => {
    const line = bootLines[currentLine];
    setTypedText('');
    let i = 0;
    const typeTimer = setInterval(() => {
      if (i <= line.length) {
        setTypedText(line.substring(0, i));
        i++;
      } else {
        clearInterval(typeTimer);
      }
    }, 20);
    return () => clearInterval(typeTimer);
  }, [currentLine]);

  const handleSkip = useCallback(() => {
    if (!isExiting) {
      setIsExiting(true);
      setTimeout(onComplete, 600);
    }
  }, [isExiting, onComplete]);

  const progressPercent = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[9999] bg-[#060a14] cursor-pointer select-none overflow-hidden"
          onClick={handleSkip}
        >
          {/* 3D Scene Background */}
          <Suspense fallback={null}>
            <IntroScene3D progress={progress} />
          </Suspense>

          {/* Dark overlay for readability — fades as progress increases */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(6,10,20,${0.7 - progress * 0.3}) 100%)`,
            }}
          />

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Shield Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full scale-150" />
              <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/40 flex items-center justify-center backdrop-blur-md relative shadow-[0_0_40px_rgba(244,63,94,0.3)]">
                <Shield className="w-14 h-14 text-primary" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-white mb-2"
            >
              Sentinel
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-primary/60 font-mono text-xs tracking-[0.4em] uppercase mb-12"
            >
              Campus Protocol v4.0
            </motion.p>
          </div>

          {/* Boot Terminal — Bottom Left */}
          <div className="absolute bottom-24 left-8 md:left-12 max-w-md pointer-events-none">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-1"
            >
              {bootLines.slice(0, currentLine).map((line, i) => (
                <p key={i} className="text-[10px] font-mono text-white/15 leading-relaxed">
                  {line}
                </p>
              ))}
              <p className="text-xs font-mono text-primary/70 leading-relaxed">
                {typedText}
                <span className="animate-pulse">▊</span>
              </p>
            </motion.div>
          </div>

          {/* Progress Bar — Bottom */}
          <div className="absolute bottom-8 left-8 right-8 md:left-12 md:right-12 pointer-events-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
                <Terminal size={10} className="text-primary/40" />
                System Initialization
              </span>
              <span className="text-[9px] font-mono text-primary/50 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-punch-yellow to-primary rounded-full"
                style={{ width: `${progressPercent}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>

          {/* Skip Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 right-8 md:right-12 text-[9px] font-mono text-white/10 uppercase tracking-[0.3em] pointer-events-none"
          >
            Click to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicIntro;
