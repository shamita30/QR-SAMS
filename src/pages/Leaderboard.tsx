import React, { useState } from 'react';
import { 
  Trophy, Medal, 
  ArrowUp, ArrowDown, Search,
  Award, Zap, Flame, Crown, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';

const players = [
  { id: 1, name: 'Alex Johnson', xp: 12450, trend: 'up', role: 'Level 40 Architect', avatar: 'A' },
  { id: 2, name: 'Sarah Chen', xp: 11200, trend: 'up', role: 'Level 38 Explorer', avatar: 'S' },
  { id: 3, name: 'Michael Sun', xp: 10850, trend: 'down', role: 'Level 35 Veteran', avatar: 'M' },
  { id: 4, name: 'Elena Rodriguez', xp: 9400, trend: 'up', role: 'Level 30 Scout', avatar: 'E' },
  { id: 5, name: 'David Kim', xp: 8900, trend: 'neutral', role: 'Level 28 Novice', avatar: 'D' },
  { id: 6, name: 'Priya Patel', xp: 8200, trend: 'up', role: 'Level 25 Novice', avatar: 'P' },
];

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'DEPARTMENT' | 'FRIENDS'>('GLOBAL');

  const topThree = players.slice(0, 3);
  const remainingPlayers = players.slice(3);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
            Campus Elite
          </h2>
          <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
            Global Rankings
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            Monitor punctuality, engagement, and XP vectors across all nodes.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          {['GLOBAL', 'DEPARTMENT', 'FRIENDS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12">
        {/* Second Place */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="order-2 md:order-1"
        >
          <GlassCard className="text-center pb-8 border-b-4 border-b-secondary/40">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-secondary/10 border-2 border-secondary/40 p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-outfit text-2xl font-bold text-secondary">
                  {topThree[1].avatar}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary border-4 border-background flex items-center justify-center text-white">
                <Medal size={14} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{topThree[1].name}</h3>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-4">{topThree[1].role}</p>
            <div className="px-4 py-2 bg-secondary/5 rounded-xl border border-secondary/10 inline-flex items-center gap-2">
              <Zap size={14} className="text-secondary" />
              <span className="text-sm font-bold text-white">{topThree[1].xp.toLocaleString()} XP</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* First Place */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 md:order-2"
        >
          <GlassCard className="text-center pb-12 pt-10 border-t-4 border-t-primary shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-primary/20">
            <div className="relative inline-block mb-8">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 text-primary"
              >
                <Crown size={40} className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </motion.div>
              <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/40 p-1 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-outfit text-4xl font-bold text-primary">
                  {topThree[0].avatar}
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-primary border-4 border-background flex items-center justify-center text-white shadow-lg">
                <Trophy size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1 uppercase tracking-tighter">{topThree[0].name}</h3>
            <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-6">{topThree[0].role}</p>
            <div className="px-8 py-3 bg-primary/10 rounded-2xl border border-primary/20 inline-flex items-center gap-2 mb-4">
              <Zap size={18} className="text-primary" />
              <span className="text-xl font-bold text-white tracking-tight">{topThree[0].xp.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-accent text-[10px] uppercase font-bold tracking-widest">
               <Flame size={14} /> Hot Streak: 12 Sessions
            </div>
          </GlassCard>
        </motion.div>

        {/* Third Place */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="order-3 md:order-3"
        >
          <GlassCard className="text-center pb-8 border-b-4 border-b-accent/40">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/40 p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-outfit text-2xl font-bold text-accent">
                  {topThree[2].avatar}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent border-4 border-background flex items-center justify-center text-white">
                <Medal size={14} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{topThree[2].name}</h3>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-4">{topThree[2].role}</p>
            <div className="px-4 py-2 bg-accent/5 rounded-xl border border-accent/10 inline-flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              <span className="text-sm font-bold text-white">{topThree[2].xp.toLocaleString()} XP</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Rewards Progress */}
      <GlassCard className="bg-gradient-to-r from-primary/10 via-background to-transparent border-primary/20" hover={false}>
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 rotate-3">
                  <Award size={32} />
               </div>
               <div>
                  <h4 className="text-white font-bold uppercase tracking-wider italic">Season Reward Pending</h4>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest mt-1">Next Tier Reward – 580 XP Remaining</p>
               </div>
            </div>
            <div className="w-full md:w-1/2">
               <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{ width: '65%' }} />
               </div>
               <div className="flex justify-between text-[10px] font-bold text-white/30 tracking-tighter">
                  <span>BRONZE</span>
                  <span className="text-primary">SILVER</span>
                  <span>GOLD</span>
               </div>
            </div>
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[10px] font-bold tracking-[0.2em] transition-all uppercase">
               View Vault →
            </button>
         </div>
      </GlassCard>

      {/* Rankings List */}
      <GlassCard className="p-0 overflow-hidden" hover={false}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2 relative flex-1 max-w-sm">
              <Search className="absolute left-4 text-white/20" size={14} />
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-primary/40 transition-all font-medium" 
                placeholder="Search campus records..." 
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
                <th className="px-8 py-4">Ranking Node</th>
                <th className="px-6 py-4">Sentinel Identity</th>
                <th className="px-6 py-4">Current XP</th>
                <th className="px-6 py-4">Vector Trend</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {remainingPlayers.map((player, index) => (
                <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-outfit font-bold text-white/40 group-hover:text-primary group-hover:border-primary/30 transition-all">
                      #{index + 4}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-xs">
                        {player.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5 group-hover:text-primary transition-all uppercase tracking-tight">{player.name}</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic">{player.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <Zap size={14} className="text-primary/60" />
                       <span className="text-sm font-bold text-white/80">{player.xp.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {player.trend === 'up' ? (
                      <div className="flex items-center gap-1.5 text-accent text-[10px] font-bold">
                        <ArrowUp size={12} className="animate-bounce" /> +2 Nodes
                      </div>
                    ) : player.trend === 'down' ? (
                      <div className="flex items-center gap-1.5 text-secondary text-[10px] font-bold">
                        <ArrowDown size={12} /> -1 Nodes
                      </div>
                    ) : (
                      <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest italic">Stable</div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2.5 rounded-xl hover:bg-primary/20 text-white/20 hover:text-primary transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Leaderboard;
