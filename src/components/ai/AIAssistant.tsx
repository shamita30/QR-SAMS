import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AIAssistant: React.FC = () => {
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-[0_8px_32px_rgba(59,130,246,0.4)] z-[100] group overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-background animate-bounce">
         <Sparkles size={10} className="text-white" />
      </div>
      <Bot size={28} className="relative z-10" />
      
      {/* Animated Ping */}
      <div className="absolute inset-0 rounded-3xl bg-primary/40 animate-ping opacity-20" />
    </motion.button>
  );
};

export default AIAssistant;
