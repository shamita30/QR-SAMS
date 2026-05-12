import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const rotateX = (mousePos.y - 0.5) * -12;
  const rotateY = (mousePos.x - 0.5) * 12;
  
  // Holographic shimmer position
  const shimmerX = mousePos.x * 100;
  const shimmerY = mousePos.y * 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0.5, y: 0.5 }); }}
      style={{
        transform: isHovered
          ? `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.2s ease-out',
      }}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer ${className}`}
    >
      {/* Glassmorphism base */}
      <div className="absolute inset-0 bg-[rgba(16,20,36,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-2xl" />
      
      {/* Holographic shimmer overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${shimmerX}% ${shimmerY}%, rgba(244,63,94,0.15) 0%, rgba(56,189,248,0.08) 30%, rgba(253,164,175,0.05) 50%, transparent 70%)`,
        }}
      />

      {/* Rainbow border effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `conic-gradient(from ${shimmerX * 3.6}deg at ${shimmerX}% ${shimmerY}%, #f43f5e40, #fda4af30, #93c5fd30, #38bdf830, #f43f5e40)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
          borderRadius: '1rem',
        }}
      />

      {/* Ambient glow on hover */}
      <div
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${shimmerX}% ${shimmerY}%, rgba(244,63,94,0.1) 0%, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default HolographicCard;
