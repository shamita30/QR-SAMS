import React from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'yellow' | 'teal' | 'pink';
  disabled?: boolean;
}

const variantStyles = {
  primary: {
    bg: 'from-[#ff8243] to-[#ff6b20]',
    shadow: 'shadow-[0_4px_20px_rgba(255,130,67,0.35)]',
    hoverShadow: '0 6px 30px rgba(255,130,67,0.5)',
    ring: 'ring-[#ff8243]/30',
  },
  yellow: {
    bg: 'from-[#fce883] to-[#ffd700]',
    shadow: 'shadow-[0_4px_20px_rgba(252,232,131,0.35)]',
    hoverShadow: '0 6px 30px rgba(252,232,131,0.5)',
    ring: 'ring-[#fce883]/30',
  },
  teal: {
    bg: 'from-[#609494] to-[#4d7a7a]',
    shadow: 'shadow-[0_4px_20px_rgba(96,148,148,0.35)]',
    hoverShadow: '0 6px 30px rgba(96,148,148,0.5)',
    ring: 'ring-[#609494]/30',
  },
  pink: {
    bg: 'from-[#ffc0cb] to-[#ffaab8]',
    shadow: 'shadow-[0_4px_20px_rgba(255,192,203,0.35)]',
    hoverShadow: '0 6px 30px rgba(255,192,203,0.5)',
    ring: 'ring-[#ffc0cb]/30',
  },
};

const NeonButton: React.FC<NeonButtonProps> = ({ children, onClick, className = '', variant = 'primary', disabled = false }) => {
  const style = variantStyles[variant];
  const textColor = variant === 'yellow' ? 'text-black' : 'text-white';

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-xl font-bold text-sm
        bg-gradient-to-r ${style.bg} ${style.shadow}
        ${textColor}
        transition-all duration-300
        flex items-center gap-2
        overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        boxShadow: disabled ? 'none' : undefined,
      }}
    >
      {/* Shimmer overlay */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export default NeonButton;
