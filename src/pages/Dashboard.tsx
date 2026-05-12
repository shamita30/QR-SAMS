import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { Play, Lock, Star, ChevronRight, Zap, Coins, Trophy, Map as MapIcon, ShieldAlert } from 'lucide-react';
import NeonButton from '../components/ui/NeonButton';

const questWorlds = [
  {
    id: 'db-city',
    title: 'Database City',
    description: 'Learn SQL and Data Structures',
    status: 'unlocked',
    progress: 45,
    levels: [
      { id: 1, name: 'Introduction to SQL', status: 'completed', stars: 3 },
      { id: 2, name: 'Joins & Relations', status: 'completed', stars: 2 },
      { id: 3, name: 'ER Diagrams', status: 'active', stars: 0 },
      { id: 4, name: 'Normalization', status: 'locked', stars: 0 },
      { id: 5, name: 'Boss: Database Guardian', status: 'locked', stars: 0, isBoss: true }
    ]
  },
  {
    id: 'cpu-towers',
    title: 'CPU Towers',
    description: 'Architecture & Operating Systems',
    status: 'locked',
    progress: 0,
    levels: []
  },
  {
    id: 'cyber-lab',
    title: 'Cyber Security Labs',
    description: 'Cryptography & Firewalls',
    status: 'locked',
    progress: 0,
    levels: []
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { xp, level, getRank, coins, streak } = useGamificationStore();
  const currentRank = getRank();

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#060a14] relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* CSS Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 relative z-10">
        
        {/* HEADER / PLAYER HUD */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl lg:text-6xl font-outfit font-black tracking-tighter uppercase text-white mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sentinel</span> Universe
            </h1>
            <p className="text-sm font-mono text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
              <MapIcon size={14} className="text-primary" /> Global Quest Map Active
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/5 shadow-neon-blue">
              <Zap className="text-primary" size={20} />
              <div>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest leading-none mb-1">Rank: {currentRank.name}</p>
                <p className="text-xl font-black font-outfit text-white leading-none">LVL {level}</p>
              </div>
            </div>
            <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/5 shadow-neon-pink">
              <Coins className="text-[#fce883]" size={20} />
              <div>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest leading-none mb-1">Wallet</p>
                <p className="text-xl font-black font-outfit text-white leading-none">{coins}</p>
              </div>
            </div>
          </div>
        </header>

        {/* QUEST WORLDS */}
        <div className="space-y-16">
          {questWorlds.map((world, idx) => (
            <motion.div 
              key={world.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`relative ${world.status === 'locked' ? 'opacity-50 grayscale' : ''}`}
            >
              {/* World Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${world.status === 'unlocked' ? 'bg-gradient-to-br from-primary to-accent shadow-neon-blue' : 'bg-white/10'}`}>
                    {world.status === 'unlocked' ? <Trophy className="text-white" size={30} /> : <Lock className="text-white/30" size={30} />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter text-white">{world.title}</h2>
                    <p className="text-sm font-mono text-white/50 uppercase tracking-widest">{world.description}</p>
                  </div>
                </div>
                {world.status === 'unlocked' && (
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-2">World Mastery</p>
                    <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(0,212,255,0.8)]" style={{ width: `${world.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Levels Map (Side scrolling container) */}
              <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 -mx-4 snap-x">
                {world.levels.map((level, lIdx) => (
                  <div key={level.id} className="snap-center relative shrink-0">
                    {/* Connection Line */}
                    {lIdx !== 0 && (
                      <div className="absolute top-1/2 -left-6 w-6 h-1 bg-white/10 -translate-y-1/2 -z-10" />
                    )}

                    <div className={`w-64 glass rounded-[2rem] p-6 border transition-all duration-300 ${
                      level.status === 'active' ? 'border-primary shadow-[0_0_30px_rgba(0,212,255,0.2)] scale-105' : 
                      level.status === 'completed' ? 'border-[#fce883]/30' : 'border-white/5 opacity-50'
                    }`}>
                      {/* Boss Indicator */}
                      {level.isBoss && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                          <ShieldAlert size={14} className="text-white" />
                        </div>
                      )}

                      <p className="text-[10px] font-bold font-mono uppercase tracking-widest mb-2 flex justify-between">
                        <span className={level.status === 'active' ? 'text-primary' : 'text-white/40'}>Level {level.id}</span>
                        {level.status === 'completed' && (
                          <span className="flex gap-1 text-[#fce883]">
                            {[...Array(3)].map((_, i) => <Star key={i} size={10} fill={i < level.stars ? 'currentColor' : 'transparent'} />)}
                          </span>
                        )}
                      </p>
                      
                      <h3 className={`font-outfit font-black text-xl leading-tight mb-6 ${level.isBoss ? 'text-red-400' : 'text-white'}`}>
                        {level.name}
                      </h3>

                      {level.status === 'locked' ? (
                        <div className="w-full py-3 rounded-xl bg-white/5 flex items-center justify-center text-white/30">
                          <Lock size={16} />
                        </div>
                      ) : level.status === 'completed' ? (
                        <NeonButton onClick={() => navigate('/runner')} variant="pink" className="w-full py-3 text-[10px] justify-center text-white/50 border-white/10 hover:border-white/30">
                          Replay Run
                        </NeonButton>
                      ) : (
                        <NeonButton onClick={() => navigate('/runner')} variant="primary" className="w-full py-3 justify-center shadow-neon-blue animate-pulse">
                          <Play size={16} fill="currentColor" /> Play Level
                        </NeonButton>
                      )}
                    </div>
                  </div>
                ))}
                
                {world.status === 'locked' && (
                  <div className="w-full h-48 glass rounded-[2rem] border-white/5 flex flex-col items-center justify-center text-white/30 shrink-0">
                    <Lock size={32} className="mb-4" />
                    <p className="font-outfit font-bold uppercase tracking-widest text-sm">Complete previous world to unlock</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
