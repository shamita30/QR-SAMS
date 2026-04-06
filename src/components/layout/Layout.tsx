import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AIAssistant from '../ai/AIAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import ToastContainer from '../ui/ToastContainer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar background decoration */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AIAssistant />
      <ToastContainer />
    </div>
  );
};

export default Layout;
