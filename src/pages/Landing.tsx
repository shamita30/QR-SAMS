import React, { Suspense, lazy, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Shield, ArrowRight, Terminal, Zap, ChevronDown, Gamepad2, Coins, Crown, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NeonButton from '../components/ui/NeonButton';

const TechOrbit3D = lazy(() => import('../components/ui/TechOrbit3D'));

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8 text-[#ff8243]" />,
      title: "Gamified Learning",
      description: "Level up your academic career. Earn XP, collect coins, and unlock new zones.",
      tag: "CORE",
      color: "from-[#ff8243]/20 to-[#fce883]/5"
    },
    {
      icon: <Target className="w-8 h-8 text-[#fce883]" />,
      title: "Daily Missions",
      description: "Complete daily and weekly quests to maintain streaks and climb the leaderboard.",
      tag: "QUESTS",
      color: "from-[#fce883]/20 to-[#ff8243]/5"
    },
    {
      icon: <Crown className="w-8 h-8 text-[#00d4ff]" />,
      title: "Rank Progression",
      description: "Rise from Freshman to Mythic Architect. Show off your status with custom avatars.",
      tag: "STATUS",
      color: "from-[#00d4ff]/20 to-[#609494]/5"
    },
    {
      icon: <Zap className="w-8 h-8 text-[#ffc0cb]" />,
      title: "Skill Trees",
      description: "Invest your XP into specific skill branches. Unlock rare power-ups and abilities.",
      tag: "SKILLS",
      color: "from-[#ffc0cb]/20 to-[#a855f7]/5"
    },
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden font-inter relative">
      <Suspense fallback={null}>
        <TechOrbit3D fullPage />
      </Suspense>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-animated pointer-events-none opacity-40 z-[1]" />

      <div className="fixed inset-0 pointer-events-none z-[2]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a14]/80 via-[#060a14]/60 to-[#060a14]/95" />
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#060a14] to-transparent" />
      </div>

      {/* ═══ Navigation ═══ */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-[#ff8243]/10 border border-[#ff8243]/30 flex items-center justify-center shadow-neon-orange"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Shield className="text-[#ff8243] w-6 h-6" />
          </motion.div>
          <div>
            <span className="font-outfit font-black text-xl tracking-tighter uppercase text-white">Sentinel</span>
            <span className="font-mono text-[8px] text-[#ff8243] block -mt-1 tracking-[0.3em] font-bold">Metaverse v5.0</span>
          </div>
        </div>
        <div className="flex gap-3">
          <NeonButton onClick={() => navigate('/login')} className="text-xs uppercase tracking-[0.15em] py-2 px-6 shadow-neon-orange" variant="primary">
            PLAY NOW <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </NeonButton>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-40 max-w-5xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-20"
      >
        <div className="flex flex-col items-center text-center min-h-[70vh] justify-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#fce883]/10 border border-[#fce883]/30 shadow-neon-yellow backdrop-blur-md"
            >
              <Coins size={14} className="text-[#fce883] animate-coin-spin" />
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#fce883] font-mono">Season 1: Genesis</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[6rem] font-black font-outfit uppercase tracking-tighter leading-[0.85]"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8243] via-[#fce883] to-[#ff8243] animate-gradient">
                Level Up
              </span>
              <br />
              <span className="text-white">Your Future</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-lg text-white/60 max-w-xl mx-auto font-medium leading-relaxed"
            >
              Enter the immersive academic metaverse. Complete missions, maintain your learning streak, collect rewards, and conquer the leaderboard.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <NeonButton onClick={() => navigate('/login')} variant="primary" className="w-full sm:w-auto py-4 px-10 text-sm uppercase tracking-[0.15em] font-black">
                <Gamepad2 size={18} /> Enter Metaverse
              </NeonButton>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div 
            className="mt-20 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] font-bold">Scroll to explore</span>
            <ChevronDown size={14} className="text-[#ff8243]" />
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ FEATURES ═══ */}
      <section ref={featuresRef} className="relative z-30 max-w-7xl mx-auto px-6 md:px-12 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-mono font-bold text-[#ff8243] uppercase tracking-[0.4em]">Game Mechanics</span>
          <h2 className="text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter mt-3 text-white">
            Not Just a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8243] to-[#fce883]">Dashboard</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card p-6 relative overflow-hidden group h-full"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-[0.3em] px-2 py-1 bg-white/5 rounded-md">
                    {feature.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-40 border-t border-white/[0.05] py-8 text-center bg-black/40 backdrop-blur-xl">
        <p className="text-[10px] text-[#ff8243]/50 font-bold uppercase tracking-[0.3em] font-mono">
          &copy; {new Date().getFullYear()} Sentinel Metaverse • Systems Online
        </p>
      </footer>
    </div>
  );
};

export default Landing;
