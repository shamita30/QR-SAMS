import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AIAssistant from '../ai/AIAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import ToastContainer from '../ui/ToastContainer';
import AchievementPopup from '../gamification/AchievementPopup';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

// Floating particles for the metaverse background
const MetaverseParticles: React.FC = () => {
  const particles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${8 + Math.random() * 12}s`,
      size: `${2 + Math.random() * 4}px`,
      color: ['#ff8243', '#fce883', '#609494', '#ffc0cb', '#00d4ff'][Math.floor(Math.random() * 5)],
      opacity: 0.15 + Math.random() * 0.2,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full particle"
          style={{
            left: p.left,
            bottom: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            '--delay': p.delay,
            '--duration': p.duration,
            boxShadow: `0 0 6px ${p.color}40`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#060a14] overflow-hidden relative">
      {/* Animated ambient mesh gradients — Tropical Fusion */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-[#ff8243]/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-[#ffc0cb]/[0.02] blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#609494]/[0.03] blur-[120px] rounded-full pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-[#fce883]/[0.02] blur-[100px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '15s' }} />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid-animated pointer-events-none opacity-40" />

      {/* Floating particles */}
      <MetaverseParticles />
      
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AIAssistant />
      <ToastContainer />
      <AchievementPopup />
    </div>
  );
};

export default Layout;
