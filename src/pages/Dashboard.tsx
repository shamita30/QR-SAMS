import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useToastStore } from '../store/useToastStore';
import { 
  BookOpen, Server, Users as UsersIcon, 
  Layout, Send, Mic, FileEdit, 
  Search, ExternalLink, Download
} from 'lucide-react';
import { api } from '../services/api';

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
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [courses, setCourses] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [liveData, setLiveData] = useState({
    attendanceScore: 100,
    overallCompletion: 0,
    skillsMastery: 0,
    pendingCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (user && user.role === 'STUDENT') {
          const r = await api.fetch(`/api/student/${user.id}/insights`);
          const data = await r.json();
          if (!data.error) setLiveData(data);
        }
        
        const [courseRes, broadcastRes] = await Promise.all([
          api.fetch('/api/courses'),
          api.fetch('/api/broadcasts')
        ]);
        
        const coursesData = await courseRes.json();
        const broadcastsData = await broadcastRes.json();
        
        setCourses(coursesData);
        setBroadcasts(broadcastsData);
      } catch (err) {
        console.error('Neural sequence interruption:', err);
        addToast('Data synchronization failed.', 'ERROR');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-white/50 animate-pulse">Initializing Interface...</div>;

  const tabs = ['Dashboard', 'Academics', 'AI Tutor', 'Virtual Lab', 'Community'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-[10px] md:text-xs mb-2 neon-glow">
            {user?.role === 'STUDENT' ? 'Student Portal' : user?.role === 'ADMIN' ? 'System Command' : `${user?.role} Dashboard`}
          </h2>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit leading-tight lg:leading-normal">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name}</span>
          </h1>
          <p className="text-xs md:text-sm text-white/40 mt-2 font-medium">
            System status: <span className="text-accent">Nominal</span> • All campus protocols are active.
          </p>
        </div>
        
        {user?.role === 'STUDENT' && (
          <NeonButton 
            className="w-full md:w-auto shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            onClick={() => navigate('/mark-attendance')}
          >
            <Plus size={18} /> Mark Attendance
          </NeonButton>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="w-full overflow-x-auto pb-2 custom-scrollbar -mb-2">
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-max border border-white/10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'Dashboard' && renderDashboard()}
        {activeTab === 'Academics' && renderAcademics()}
        {activeTab === 'AI Tutor' && renderAITutor()}
        {activeTab === 'Virtual Lab' && renderVirtualLab()}
        {activeTab === 'Community' && renderCommunity()}
      </div>
    </div>
  );

  function renderDashboard() {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
              <h3 className="text-3xl font-bold text-white font-outfit">{liveData.attendanceScore}%</h3>
              <p className="text-xs text-white/20 mb-1 font-medium italic">Target: 95%</p>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${liveData.attendanceScore}%` }}
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
              <h3 className="text-3xl font-bold text-white font-outfit">{(8.0 + (liveData.overallCompletion / 50)).toFixed(2)}</h3>
              <p className="text-xs text-secondary mb-1 font-medium italic">Auto-calculated</p>
            </div>
            <p className="text-[10px] text-white/20 font-medium">{liveData.overallCompletion}% projects completed</p>
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
              <h3 className="text-3xl font-bold text-white font-outfit">{1000 + (liveData.overallCompletion * 20) + liveData.skillsMastery}</h3>
            </div>
            <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase mb-1">
              <span>Next: Elite</span>
              <span>{5000 - (1000 + (liveData.overallCompletion * 20) + liveData.skillsMastery)} XP needed</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-white/20" style={{ width: '70%' }} />
            </div>
          </GlassCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0f2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#3b82f6' }} />
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
                  <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Upcoming & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <GlassCard hover={false} className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Clock size={18} className="text-primary" /> Upcoming Sessions
              </h3>
              <Calendar size={18} className="text-white/20" />
            </div>
            <div className="space-y-4">
               {courses.slice(0, 3).map((session, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                   <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-white/5 border border-white/10 group-hover:border-primary/40 transition-all font-outfit text-primary font-bold">
                      {session.id.substring(0,2)}
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-0.5">{session.name}</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{session.time}</span>
                         <span className="w-1 h-1 rounded-full bg-white/10" />
                         <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{session.dept}</span>
                      </div>
                   </div>
                   <NeonButton className="py-2 px-4 text-[10px]">Enter</NeonButton>
                 </div>
               ))}
               {courses.length === 0 && <p className="text-center text-white/20 py-8 italic text-xs">No upcoming sessions detected.</p>}
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
               {broadcasts.slice(0, 2).map((note, i) => (
                 <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs uppercase">
                       {note.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                          <h4 className="text-[10px] font-bold text-white/30 tracking-widest uppercase">{note.author}</h4>
                          <span className="text-[10px] text-white/20 font-mono tracking-tighter">Real-time</span>
                       </div>
                       <p className="text-sm text-white/70 leading-relaxed font-medium">
                          {note.message}
                       </p>
                    </div>
                 </div>
               ))}
               {broadcasts.length === 0 && <p className="text-center text-white/20 py-8 italic text-xs">No recent briefings discovered.</p>}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  function renderAcademics() {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="text-primary" /> Active Enrollment
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs w-48 outline-none focus:border-primary/50" placeholder="Search syllabus..." />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {courses.map(cls => (
                <div key={cls.id} className="glass p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 group-hover:scale-110 transition-transform">
                      <Layout size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold">{cls.name}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{cls.id} • {cls.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => addToast(`Opening syllabus for ${cls.id}`, 'INFO')} className="p-2 glass rounded-lg text-white/40 hover:text-white" title="Syllabus">
                      <FileEdit size={16} />
                    </button>
                    <button onClick={() => addToast(`Opening resources for ${cls.id}`, 'INFO')} className="p-2 glass rounded-lg text-white/40 hover:text-white" title="Resources">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <GlassCard className="bg-primary/5 border-primary/20 p-6">
               <h3 className="font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                 <Plus size={16} className="text-primary" /> Academic Portal
               </h3>
               <p className="text-xs text-white/50 mb-6 italic leading-relaxed">Securely upload your academic credentials for verification and grade processing.</p>
               <div className="space-y-3">
                  <button 
                    onClick={() => addToast('Selecting Grade Sheet...', 'LOADING')}
                    className="w-full py-4 glass border border-dashed border-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:border-primary/50 hover:text-white transition-all flex flex-col items-center gap-2"
                  >
                    <Download size={24} className="opacity-20" />
                    Drop Grade Sheets
                  </button>
                  <NeonButton 
                    onClick={() => addToast('Uploading grades to registrar...', 'LOADING')}
                    className="w-full py-3 text-[10px] justify-center"
                  >
                    Transmit to Registrar
                  </NeonButton>
               </div>
            </GlassCard>

            <div className="glass-card p-6 border-l-4 border-l-accent">
               <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                 <Activity size={14} className="text-accent" /> GPA Trajectory
               </h4>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-accent" style={{ width: '82%' }} />
               </div>
               <p className="text-[10px] text-accent font-bold">Estimated Next Sem: 8.5 CGPA</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAITutor() {
    const isSaravanan = user?.name?.includes('Saravanan') || user?.id === 'fac_cse_1';
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500">
        {/* Chat Interface */}
        <div className="lg:col-span-3 glass-card p-0 flex flex-col h-[500px] overflow-hidden">
           <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Sentinel AI Mentor</h3>
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Active • Neural Engine v4.0</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-white/20 hover:text-white transition-all"><Mic size={16} /></button>
              </div>
           </div>
           
           <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <div className="flex gap-3 max-w-[80%]">
                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white/40">AI</div>
                 <div className="p-4 glass rounded-2xl rounded-tl-none border-white/5">
                    <p className="text-sm leading-relaxed">System operational. Hello {user?.name.split(' ')[0]}, how can I assist with your academic protocols today?</p>
                 </div>
              </div>
              
              {isSaravanan && (
                <div className="flex gap-3 max-w-[80%]">
                   <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20 text-primary">AI</div>
                   <div className="p-4 glass rounded-2xl rounded-tl-none border-primary/20 bg-primary/5">
                      <p className="text-sm leading-relaxed font-bold italic text-primary">Protocol Detected: Faculty Input Required.</p>
                      <p className="text-sm leading-relaxed mt-2">Prof. Saravanan, would you like me to generate a new lesson plan for "Cloud Computing" based on the current student performance metrics?</p>
                   </div>
                </div>
              )}
           </div>

           <div className="p-4 border-t border-white/10">
              <div className="relative">
                 <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-primary/50" placeholder="Type command..." />
                 <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-lg text-white shadow-lg shadow-primary/20">
                    <Send size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
           {isSaravanan && (
             <GlassCard className="bg-primary/10 border-primary/30 p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Zap size={14} /> Faculty Toolkit
                </h3>
                <button 
                   onClick={() => {
                     addToast('Analyzing student performance vectors...', 'LOADING');
                     setTimeout(() => addToast('Lesson Plan Generated for Cloud Computing', 'SUCCESS'), 2000);
                   }}
                   className="w-full btn-primary text-xs justify-center py-4 rounded-2xl shadow-xl shadow-primary/20 mb-3"
                >
                  Generate Lesson Plan
                </button>
                <button 
                   onClick={() => addToast('Broadcasting lecture summary to S7-CSE...', 'INFO')}
                   className="w-full btn-secondary text-xs justify-center py-4 rounded-2xl border-white/10 italic"
                >
                  Broadcast Summary
                </button>
             </GlassCard>
           )}

           <div className="glass-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 italic">Neural Insight</h3>
              <p className="text-xs text-white/60 leading-relaxed">Our AI suggests focusing on <span className="text-primary font-bold">"Microservices Orchestration"</span> as 70% of the class showed decreased engagement in Lab 4.</p>
           </div>
        </div>
      </div>
    );
  }

  function renderVirtualLab() {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="flex items-center justify-between">
           <h3 className="text-xl font-bold flex items-center gap-2">
             <Server className="text-accent" /> Infrastructure Grid
           </h3>
           <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">9 Active</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">2 Pending</span>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <GlassCard key={i} className="p-6 group border-t-4 border-t-accent">
                 <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-accent group-hover:scale-110 transition-transform">
                      <Server size={24} />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Instance ID</p>
                       <p className="text-xs font-mono text-white/60">CSE-LAB02-{i}0{i}</p>
                    </div>
                 </div>
                 
                 <h4 className="text-lg font-bold mb-1">Compute Node {i}</h4>
                 <p className="text-xs text-white/40 mb-6 italic">Ready for simulation protocols</p>

                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                       <p className="text-[10px] text-white/20 uppercase font-bold mb-1">CPU Load</p>
                       <p className="text-sm font-bold text-accent">{15 + i * 12}%</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                       <p className="text-[10px] text-white/20 uppercase font-bold mb-1">RAM</p>
                       <p className="text-sm font-bold text-accent">{2 + i * 2}GB/16GB</p>
                    </div>
                 </div>

                 <button 
                  onClick={() => addToast(`Initializing Compute Node ${i}...`, 'LOADING')}
                  className="w-full py-3 btn-primary text-xs justify-center shadow-lg shadow-accent/20"
                 >
                   Establish SSH Bridge
                 </button>
              </GlassCard>
            ))}
         </div>
      </div>
    );
  }

  function renderCommunity() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-bold flex items-center gap-2">
             <UsersIcon className="text-secondary" /> Campus Nexus
           </h3>
           <div className="space-y-4">
              {broadcasts.slice(0, 5).map((b, i) => (
                <div key={b.id || i} className="glass p-6 rounded-2xl border border-white/5 hover:border-secondary/20 transition-all">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-[10px]">
                            {b.author?.charAt(0) || 'A'}
                         </div>
                         <div>
                            <h4 className="text-sm font-bold">{b.title}</h4>
                            <p className="text-[10px] text-white/40 italic uppercase tracking-widest">BY {b.author || 'SYSTEM'}</p>
                         </div>
                      </div>
                      <span className="text-[10px] text-white/20 font-mono italic">{new Date(b.timestamp).toLocaleDateString()}</span>
                   </div>
                   <p className="text-sm text-white/70 leading-relaxed font-medium pl-11">{b.message}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <GlassCard className="p-6 bg-secondary/5 border-secondary/20">
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                <Globe size={14} /> Faculty Forum
              </h3>
              <p className="text-xs text-white/50 mb-6 italic leading-relaxed">Private research discussion board for validated faculty members only.</p>
              <button 
                onClick={() => addToast('Verifying faculty credentials...', 'LOADING')}
                className="w-full btn-secondary text-xs justify-center py-4 italic"
              >
                Enter Decrypted Forum
              </button>
           </GlassCard>

           <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Member Status</h3>
                 <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">1,240 Online</span>
              </div>
              <div className="flex -space-x-3">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0a0f2d] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                     {String.fromCharCode(64 + i)}
                   </div>
                 ))}
                 <div className="w-10 h-10 rounded-full border-2 border-[#0a0f2d] bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 backdrop-blur-md">
                   +1.2k
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }
};

export default MainDashboard;
