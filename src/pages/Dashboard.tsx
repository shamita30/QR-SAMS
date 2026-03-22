import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Award, Zap, 
  Clock, Calendar, 
  Plus, MessageSquare,
  Globe, Activity
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useAuthStore } from '../store/useAuthStore';

const skillData = [
  { subject: 'Coding', A: 120, fullMark: 150 },
  { subject: 'Logic', A: 98, fullMark: 150 },
  { subject: 'UI/UX', A: 86, fullMark: 150 },
  { subject: 'Security', A: 99, fullMark: 150 },
  { subject: 'Soft Skills', A: 85, fullMark: 150 },
  { subject: 'DevOps', A: 65, fullMark: 150 },
];

const attendanceData = [
  { name: 'Mon', hours: 6 },
  { name: 'Tue', hours: 8 },
  { name: 'Wed', hours: 5 },
  { name: 'Thu', hours: 9 },
  { name: 'Fri', hours: 7 },
];

const MainDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');

  const tabs = ['Dashboard', 'Academics', 'AI Tutor', 'Virtual Lab', 'Community'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
            Student Portal
          </h2>
          <h1 className="text-4xl font-bold text-white font-outfit">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name}</span>
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            System status: <span className="text-accent">Nominal</span> • All campus protocols are active.
          </p>
        </div>
        
        <NeonButton className="pr-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <Plus size={18} /> Mark Attendance
        </NeonButton>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border-b-4 border-b-primary shadow-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Activity size={20} />
            </div>
            <div className="px-2 py-1 bg-primary/10 rounded-lg text-[9px] font-bold text-primary uppercase tracking-tighter">
              16 Days Streak
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1">Attendance Progress</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold text-white font-outfit">92%</h3>
            <p className="text-xs text-white/20 mb-1 font-medium italic">Target: 95%</p>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '92%' }}
               transition={{ duration: 1, ease: 'easeOut' }}
               className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
             />
          </div>
        </GlassCard>

        <GlassCard className="border-b-4 border-b-secondary shadow-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1">Current CGPA</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold text-white font-outfit">8.42</h3>
            <p className="text-xs text-secondary mb-1 font-medium">+0.12 pts</p>
          </div>
          <p className="text-[10px] text-white/20 font-medium">Click to view detailed grades →</p>
        </GlassCard>

        <GlassCard className="border-b-4 border-b-accent shadow-accent/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <Award size={20} />
            </div>
            <div className="w-8 h-8 rounded-full border border-accent/40 flex items-center justify-center text-accent font-bold text-xs shadow-[0_0_10px_rgba(0,210,255,0.2)]">
              #1
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1">Campus Rank</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold text-white font-outfit">Top Tier</h3>
          </div>
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Level 1 Explorer</p>
        </GlassCard>

        <GlassCard className="border-b-4 border-b-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-white/5 text-white/60">
              <Zap size={20} />
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1">Sentinel XP</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold text-white font-outfit">1,420</h3>
          </div>
          <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase mb-1">
            <span>Next: Elite</span>
            <span>280 XP needed</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-white/20" style={{ width: '70%' }} />
          </div>
        </GlassCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" hover={false}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <BarChart3 size={18} className="text-primary" /> Activity Vectors
            </h3>
            <div className="flex gap-2">
               <button className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/40 uppercase">Day</button>
               <button className="px-3 py-1 bg-primary/20 rounded-lg text-[10px] font-bold text-primary uppercase">Week</button>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0f2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <Zap size={18} className="text-primary" /> Skill Radar
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Radar
                   name="Skills"
                   dataKey="A"
                   stroke="#3b82f6"
                   fill="#3b82f6"
                   fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Upcoming & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <GlassCard hover={false} className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Clock size={18} className="text-primary" /> Upcoming Sessions
              </h3>
              <Calendar size={18} className="text-white/20" />
            </div>
            <div className="space-y-4">
               {[
                 { title: 'Advanced Algorithms', time: '10:30 AM', room: 'Hall 402', color: '#3b82f6' },
                 { title: 'Machine Learning Lab', time: '01:00 PM', room: 'Lab B', color: '#a855f7' }
               ].map((session, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                   <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-white/5 border border-white/10 group-hover:border-primary/40 transition-all font-outfit">
                      <span className="text-[10px] text-white/40 block leading-none mb-1">IST</span>
                      <span className="text-xs font-bold text-white leading-none">NOW</span>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-0.5">{session.title}</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{session.time}</span>
                         <span className="w-1 h-1 rounded-full bg-white/10" />
                         <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{session.room}</span>
                      </div>
                   </div>
                   <NeonButton className="py-2 px-4 text-[10px]">Enter</NeonButton>
                 </div>
               ))}
            </div>
         </GlassCard>

         <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <MessageSquare size={18} className="text-secondary" /> Recent Briefings
              </h3>
              <Globe size={18} className="text-white/20" />
            </div>
            <div className="space-y-4">
               {[
                 { user: 'Dr. Arul Prasad', msg: 'The Cloud Computing workshop has been rescheduled to Monday.', time: '12m ago' },
                 { user: 'Student Council', msg: 'New materials for DS Sprint are now available in the Study Area.', time: '1h ago' }
               ].map((note, i) => (
                 <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs uppercase">
                       {note.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                          <h4 className="text-[10px] font-bold text-white/30 tracking-widest uppercase">{note.user}</h4>
                          <span className="text-[10px] text-white/20 font-mono tracking-tighter">{note.time}</span>
                       </div>
                       <p className="text-sm text-white/70 leading-relaxed font-medium">
                          {note.msg}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
         </GlassCard>
      </div>
    </div>
  );
};

export default MainDashboard;
