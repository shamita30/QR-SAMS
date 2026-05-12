import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', style, hover = true, delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      style={style}
      whileHover={hover ? { 
        scale: 1.02,
        y: -4,
        boxShadow: "0 0 30px rgba(244, 63, 94, 0.15), inset 0 0 20px rgba(244, 63, 94, 0.03)",
        borderColor: "rgba(255, 255, 255, 0.2)"
      } : {}}
      className={`glass-card p-6 relative overflow-hidden group ${className} ${hover ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {children}
    </motion.div>
  );
};

export default GlassCard;
