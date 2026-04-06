import React, { useState, useEffect } from 'react';
import { 
  Award, Star, Zap, Search, 
  ChevronRight, Lock, CheckCircle2, Shield,
  Trophy, Flame, Sparkles, BookOpen, Cloud, Code, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';

const SkillBadges: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/badges');
      if (res.ok) setBadges(await res.json());
      else {
        // Fallback for demo if API fails
        setBadges([
          { id: 'b1', title: 'Cloud Pioneer', level: 'Pro', description: 'Mastered AWS/Azure deployments', icon: 'Cloud', earned: true, xp: 500, color: '#3b82f6', requirement: 'Complete 5 Cloud Labs' },
          { id: 'b2', title: 'Code Architect', level: 'Expert', description: 'Excellence in system design', icon: 'Code', earned: true, xp: 800, color: '#a855f7', requirement: 'Lead 2 Project Teams' },
          { id: 'b3', title: 'Bug Hunter', level: 'Elite', description: 'Identified 50+ critical vulnerabilities', icon: 'Shield', earned: false, xp: 1200, color: '#00d2ff', requirement: 'Submit 50 Quality Bug Reports' },
          { id: 'b4', title: 'AI Virtuoso', level: 'Pro', description: 'Implemented self-learning neural nets', icon: 'Brain', earned: false, xp: 1000, color: '#f59e0b', requirement: 'Deploy 1 ML Model to Prod' },
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch badges:', e);
    }
  };

  const filteredBadges = badges.filter(badge => {
    if (activeFilter === 'EARNED') return badge.earned;
    if (activeFilter === 'LOCKED') return !badge.earned;
    return true;
  });

  const AnimatedBadgeGraphic = ({ iconName, size = 24, color = '#3b82f6' }: { iconName: string, size?: number, color?: string }) => {
    const IconComponent = () => {
      switch (iconName) {
        case 'Award': return <Award size={size} color={color} />;
        case 'Star': return <Star size={size} color={color} />;
        case 'Zap': return <Zap size={size} color={color} />;
        case 'Search': return <Search size={size} color={color} />;
        case 'ChevronRight': return <ChevronRight size={size} color={color} />;
        case 'Lock': return <Lock size={size} color={color} />;
        case 'CheckCircle2': return <CheckCircle2 size={size} color={color} />;
        case 'Shield': return <Shield size={size} color={color} />;
        case 'Trophy': return <Trophy size={size} color={color} />;
        case 'Flame': return <Flame size={size} color={color} />;
        case 'Sparkles': return <Sparkles size={size} color={color} />;
        case 'BookOpen': return <BookOpen size={size} color={color} />;
        case 'Cloud': return <Cloud size={size} color={color} />;
        case 'Code': return <Code size={size} color={color} />;
        case 'Brain': return <Brain size={size} color={color} />;
        default: return <Award size={size} color={color} />;
      }
    };

    return (
      <motion.div
        animate={{ 
          y: [0, -5, 0],
          filter: [`drop-shadow(0px 0px 5px ${color}80)`, `drop-shadow(0px 0px 15px ${color})`, `drop-shadow(0px 0px 5px ${color}80)`]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="absolute inset-0 blur-xl opacity-50" style={{ backgroundColor: color, transform: 'scale(1.2)' }} />
        <IconComponent />
      </motion.div>
    );
  };

  const totalXp = badges.reduce((sum, badge) => sum + (badge.earned ? (badge.xp || 0) : 0), 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
            Skill Credentials
          </h2>
          <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
            Digital Milestones
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            Your verified academic and soft-skill credentials recorded on the Sentinel ledger.
          </p>
        </div>
        
        <div className="flex gap-4">
           <GlassCard hover={false} className="py-2 px-6 border-primary/20 bg-primary/5 flex items-center gap-3">
              <Flame className="text-primary" size={20} />
              <div>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mb-1">Total Yield</p>
                 <p className="text-lg font-bold text-white leading-none">{totalXp.toLocaleString()} XP</p>
              </div>
           </GlassCard>
           
           <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
              {['ALL', 'EARNED', 'LOCKED'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f as any)} 
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeFilter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBadges.map((badge, i) => (
          <GlassCard
            key={badge.id}
            delay={i * 0.1}
            onClick={() => setSelectedBadge(badge)}
            className={`flex flex-col items-center text-center relative overflow-hidden group ${!badge.earned ? 'opacity-50 grayscale' : 'hover:border-primary/50'}`}
          >
            {badge.earned && (
              <div className="absolute top-4 right-4 text-accent">
                <CheckCircle2 size={16} className="shadow-[0_0_8px_rgba(0,210,255,0.4)]" />
              </div>
            )}
            
            <div 
              className="w-24 h-24 rounded-3xl mb-6 flex items-center justify-center border border-white/5 relative group-hover:scale-110 transition-transform duration-500"
              style={{ background: `radial-gradient(circle at center, ${badge.color}15 0%, transparent 70%)` }}
            >
              <AnimatedBadgeGraphic iconName={badge.icon} size={48} color={badge.color} />
              {badge.earned && (
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute inset-[-4px] border border-dashed border-primary/20 rounded-[2rem]"
                />
              )}
            </div>
            
            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors uppercase tracking-tight leading-tight mb-1">{badge.title}</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: badge.color }}>
              {badge.level} Class
            </p>
            
            {!badge.earned ? (
              <div className="mt-auto pt-6 border-t border-white/5 w-full">
                <div className="flex items-center justify-center gap-2 text-white/20 mb-2">
                   <Lock size={12} /> <span className="text-[9px] font-bold uppercase tracking-widest">Locked Vector</span>
                </div>
                <p className="text-[10px] text-white/30 font-medium italic px-2">{badge.requirement}</p>
              </div>
            ) : (
              <div className="mt-auto pt-4 border-t border-white/5 w-full flex justify-between items-center px-4">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Sentinel Yield</span>
                <span className="text-sm font-bold text-primary">+{badge.xp} XP</span>
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setSelectedBadge(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, rotateY: 45 }} 
              animate={{ scale: 1, opacity: 1, rotateY: 0 }} 
              exit={{ scale: 0.9, opacity: 0, rotateY: -45 }} 
              className="relative w-full max-w-lg glass p-12 rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Sparkles size={160} className="text-primary" />
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div 
                  className="w-32 h-32 rounded-[2.5rem] mb-8 flex items-center justify-center border-4 border-white/5 shadow-2xl relative"
                  style={{ background: `radial-gradient(circle at center, ${selectedBadge.color}20 0%, transparent 100%)`, borderColor: `${selectedBadge.color}30` }}
                >
                   <div className="absolute inset-0 bg-white/5 animate-pulse rounded-[2.5rem]" />
                   <AnimatedBadgeGraphic iconName={selectedBadge.icon} size={64} color={selectedBadge.color} />
                </div>
                
                <h2 className="text-3xl font-bold font-outfit uppercase tracking-tighter mb-2 italic">{selectedBadge.title}</h2>
                <div className="flex gap-2 mb-8">
                  <span className="px-4 py-1.5 bg-white/5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white/30 border border-white/10 italic">Seg-ID: {selectedBadge.id.toUpperCase()}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/10`} style={{ borderColor: `${selectedBadge.color}30`, color: selectedBadge.color }}>{selectedBadge.level} Tier</span>
                </div>
                
                <p className="text-white/50 leading-relaxed mb-10 text-sm font-medium italic">
                  "{selectedBadge.description || selectedBadge.desc}" This credential is cryptographically verified by the Department HOD and recorded on the Sentinel Protocol.
                </p>

                {selectedBadge.earned ? (
                  <div className="w-full flex gap-3">
                    <NeonButton className="flex-1 py-4 uppercase tracking-[0.2em] text-xs">Broadcast Credential</NeonButton>
                    <button className="btn-secondary py-4 px-6 rounded-2xl"><Sparkles size={20} className="text-primary" /></button>
                  </div>
                ) : (
                  <div className="w-full p-8 bg-white/2 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Sync Progress</p>
                       <p className="text-[10px] font-bold text-primary uppercase">32% Completed</p>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4 p-[1px]">
                       <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: '32%' }} />
                    </div>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center italic leading-relaxed">
                       {selectedBadge.requirement}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillBadges;
