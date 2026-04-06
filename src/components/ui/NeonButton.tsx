import React from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  type = 'button',
  style
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      style={style}
      className={`relative group overflow-hidden transition-all duration-300 ${
        variant === 'primary' ? 'btn-primary' : 'btn-secondary'
      } ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* Glow Effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.button>
  );
};

export default NeonButton;
