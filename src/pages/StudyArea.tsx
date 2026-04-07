import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, BookOpen, Video, 
  FileText, Download, TrendingUp, Users,
  LayoutGrid, List, Sparkles, ChevronRight, Brain
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useAuthStore } from '../store/useAuthStore';

const materials = [
  { id: 1, title: 'Data Structures Compendium', cat: 'CSE Core', size: '12.4 MB', type: 'PDF', users: 142, hot: true, icon: FileText },
  { id: 2, 'title': 'Algorithm Design: Masterclass', cat: 'Advanced CS', size: '1.2 GB', type: 'Video', users: 89, hot: true, icon: Video },
  { id: 3, title: 'Database Security Protocols', cat: 'Security', size: '5.8 MB', type: 'PDF', users: 56, hot: false, icon: FileText },
  { id: 4, title: 'Network Infrastructure 2026', cat: 'IT Elective', size: '22 MB', type: 'Doc', users: 34, hot: false, icon: BookOpen },
  { id: 5, title: 'AI Ethics & Campus Ethics', cat: 'General', size: '15 MB', type: 'PDF', users: 78, hot: true, icon: FileText },
  { id: 6, title: 'React Performance Vectors', cat: 'Web Dev', size: '450 KB', type: 'JSON', users: 120, hot: false, icon: Sparkles },
];

const StudyArea: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/student/${user.id}/recommendations`)
        .then(res => res.json())
        .then(data => setRecommendations(data))
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-secondary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
            Study Area
          </h2>
          <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
            Global Repository
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            Access encrypted peer-learning materials and node briefings.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button className="btn-secondary">
             <Filter size={18} /> Refine Vectors
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <GlassCard className="p-4" hover={false}>
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:max-w-xl relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-secondary" />
               <input 
                 type="text" 
                 placeholder="Locate academic sectors or material IDs..." 
                 className="input-field pl-12 bg-white/2 py-2.5"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
               {['All', 'Video', 'PDF', 'Workshop', 'Core'].map(chip => (
                 <button key={chip} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/40 uppercase tracking-widest hover:border-secondary/40 hover:text-white transition-all whitespace-nowrap">
                   {chip}
                 </button>
               ))}
            </div>
         </div>
      </GlassCard>

      {/* Grid Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m, i) => (
            <GlassCard key={m.id} delay={i * 0.1} className="flex flex-col gap-6 relative group border-t-2 border-t-transparent hover:border-t-secondary/50">
              {m.hot && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                   <div className="w-1 h-1 rounded-full bg-secondary animate-pulse" />
                   <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Hot Vector</span>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-secondary group-hover:border-secondary/20 transition-all shrink-0">
                    <m.icon size={28} />
                 </div>
                 <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-secondary transition-colors uppercase tracking-tight truncate">{m.title}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">{m.cat}</span>
                       <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                       <span className="text-[10px] font-mono text-white/20">{m.type}</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4 py-4 border-y border-white/5">
                 <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Network Payload</p>
                    <p className="text-xs font-bold text-white/60">{m.size}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Active Links</p>
                    <p className="text-xs font-bold text-white/60 flex items-center gap-1.5 leading-none">
                       <Users size={12} className="text-secondary" /> {m.users} Nodes
                    </p>
                 </div>
              </div>

              <button className="w-full btn-secondary py-3.5 group-hover:bg-secondary/10 group-hover:border-secondary/30 transition-all group-hover:text-secondary uppercase text-[11px] font-bold tracking-[0.2em] shadow-lg group-hover:shadow-secondary/5">
                 <Download size={14} className="group-hover:translate-y-[-1px] transition-transform" /> Fetch Segment
              </button>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-0 overflow-hidden" hover={false}>
           <div className="divide-y divide-white/[0.05]">
              {materials.map(m => (
                <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 md:p-6 hover:bg-white/[0.02] transition-colors group">
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-secondary transition-all">
                      <m.icon size={20} />
                   </div>
                   <div className="flex-1 w-full sm:w-auto">
                      <h4 className="text-sm font-bold text-white group-hover:text-secondary transition-colors uppercase tracking-tight">{m.title}</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-0.5">{m.cat}</p>
                   </div>
                   <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="text-left sm:text-right">
                         <p className="text-xs font-bold text-white/60 uppercase">{m.size}</p>
                         <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-1">{m.type}</p>
                      </div>
                      <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-secondary/40 hover:text-secondary transition-all">
                         <Download size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </GlassCard>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 italic">
            <Brain className="text-primary" /> AI Recommended for You
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {recommendations.map((rec, i) => {
              const Icon = rec.icon === 'Video' ? Video : rec.icon === 'Sparkles' ? Sparkles : FileText;
              return (
                <GlassCard key={i} className="min-w-[300px] shrink-0 p-6 flex flex-col gap-4 border-l-4 border-l-primary hover:border-l-secondary transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold leading-tight">{rec.title}</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{rec.type}</p>
                    </div>
                  </div>
                  <p className="text-xs text-secondary/80 italic">"{rec.reason}"</p>
                  <button className="w-full btn-secondary py-2 mt-auto text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <Download size={14} /> Fetch Module
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Global Intelligence Card */}
      <GlassCard className="bg-gradient-to-r from-secondary/10 via-background to-transparent border-secondary/20" hover={false}>
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary shadow-[0_0_20px_rgba(168,85,247,0.35)] shrink-0">
               <TrendingUp size={32} />
            </div>
            <div className="flex-1">
               <h3 className="text-lg md:text-xl font-bold font-outfit uppercase italic tracking-wider">Campus Intel: Trend Segment</h3>
               <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
                  "Advanced Algorithm Design" is currently being accessed by 42 concurrent HOD nodes. New briefing segments available.
               </p>
            </div>
            <button className="hidden md:flex btn-primary bg-gradient-to-r from-secondary to-accent">
               Enter Briefing <ChevronRight size={18} />
            </button>
         </div>
      </GlassCard>
    </div>
  );
};

export default StudyArea;
