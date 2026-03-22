import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Star, 
  MessageSquare, Calendar, ChevronRight,
  PlusCircle, BookOpen, Filter,
  TrendingUp, Globe, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useAuthStore } from '../store/useAuthStore';

const Tutoring: React.FC = () => {
  const { user } = useAuthStore();
  const isAdminOrFaculty = user?.role === 'ADMIN' || user?.role === 'FACULTY' || user?.role === 'HOD';
  const [activeTab, setActiveTab] = useState<'AVAIL_TUTORS' | 'OPEN_REQUESTS'>('AVAIL_TUTORS');
  const [tutors, setTutors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    fetchTutors();
    fetchRequests();
  }, []);

  const fetchTutors = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/tutoring/tutors');
      if (res.ok) setTutors(await res.json());
      else {
        setTutors([
          { id: 't1', name: 'Dr. Sarah Chen', expert: 'Distributed Systems', rating: 4.9, sessions: 142, color: '#3b82f6' },
          { id: 't2', name: 'James Wilson', expert: 'React Native Expert', rating: 4.8, sessions: 89, color: '#a855f7' },
          { id: 't3', name: 'Elena Vance', expert: 'UX / Figma Pro', rating: 4.7, sessions: 56, color: '#00d2ff' },
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch tutors:', e);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/tutoring/requests');
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error('Failed to fetch tutoring requests:', e);
    }
  };

  const handleBroadcastRequest = async () => {
    if (!newTopic.trim()) return;
    try {
      const res = await fetch('http://localhost:3001/api/tutoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.id, topic: newTopic })
      });
      if (res.ok) {
        setShowAddRequest(false);
        setNewTopic('');
        fetchRequests();
        setActiveTab('OPEN_REQUESTS');
      }
    } catch (e) {
      console.error('Failed to broadcast request:', e);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/tutoring/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' })
      });
      if (res.ok) fetchRequests();
    } catch (e) {
      console.error('Failed to accept request:', e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-secondary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
            Peer Tutoring
          </h2>
          <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
            Knowledge Sync
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            Synchronize with domain experts or broadcast help requests across the campus node.
          </p>
        </div>
        
        <div className="flex gap-3">
          {isAdminOrFaculty ? (
            <NeonButton variant="secondary">
               <Star size={18} className="text-secondary" /> Sync as Expert
            </NeonButton>
          ) : (
            <NeonButton onClick={() => setShowAddRequest(true)} className="pr-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <PlusCircle size={18} /> Broadcast Request
            </NeonButton>
          )}
        </div>
      </div>

      {/* Stats/Ticker */}
      <GlassCard className="bg-gradient-to-r from-primary/5 to-transparent border-primary/10" hover={false}>
         <div className="flex flex-wrap items-center gap-8 md:gap-16">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <TrendingUp size={20} />
               </div>
               <div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Active Syncs</p>
                  <p className="text-lg font-bold text-white leading-none">42 Nodes</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/20">
                  <Globe size={20} />
               </div>
               <div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Global Tutors</p>
                  <p className="text-lg font-bold text-white leading-none">12 Sectors</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Verified Experts</p>
                  <p className="text-lg font-bold text-white leading-none">85 Nodes</p>
               </div>
            </div>
         </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        <button 
          onClick={() => setActiveTab('AVAIL_TUTORS')}
          className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'AVAIL_TUTORS' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
        >
          Active Experts
        </button>
        <button 
          onClick={() => setActiveTab('OPEN_REQUESTS')}
          className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'OPEN_REQUESTS' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
        >
          Open Signals
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'AVAIL_TUTORS' ? (
          <motion.div key="tutors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor, i) => (
              <GlassCard key={tutor.id} delay={i * 0.1} className="flex flex-col gap-6 relative group border-t-2 border-t-transparent hover:border-t-primary/50">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-outfit font-bold text-2xl border border-white/10 shadow-lg relative group-hover:scale-105 transition-transform" style={{ backgroundColor: `${tutor.color}15`, color: tutor.color }}>
                    <div className="absolute inset-0 bg-white/5 animate-pulse rounded-2xl" />
                    {tutor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{tutor.name}</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">{tutor.expert}</p>
                  </div>
                </div>
                
                <div className="flex justify-between p-4 bg-white/2 rounded-2xl text-center border border-white/5">
                  <div>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mb-1">Elite Rating</p>
                    <div className="flex items-center gap-1.5 text-accent justify-center">
                      <Star size={14} fill="currentColor" className="drop-shadow-[0_0_5px_rgba(0,210,255,0.4)]" />
                      <span className="text-base font-bold text-white">{tutor.rating}</span>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-white/10 self-center" />
                  <div>
                     <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mb-1">Sync Sessions</p>
                     <p className="text-base font-bold text-white">{tutor.sessions}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <NeonButton className="flex-1 py-3 text-[10px] uppercase tracking-widest">Reserve Sync</NeonButton>
                  <button className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all text-white/20 hover:text-white">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        ) : (
          <motion.div key="requests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4" hover={false}>
              <div className="flex items-center gap-3 relative flex-1 max-w-sm">
                <Search className="absolute left-4 text-white/20" size={16} />
                <input className="input-field pl-12 py-2.5 bg-white/2 text-sm" placeholder="Probe sync topics..." />
              </div>
              <button className="btn-secondary py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest">
                 <Filter size={16} /> Filter Sectors
              </button>
            </GlassCard>

            {requests.map((req, i) => (
              <GlassCard key={req.id} delay={i * 0.05} className="p-6 border-white/5 flex flex-col md:flex-row items-center justify-between group hover:border-primary/40">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-all">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors uppercase tracking-tight">{req.topic}</h3>
                    <div className="flex items-center gap-4 mt-1.5 ">
                      <span className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none"><Users size={12} className="text-secondary" /> {req.student_name}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none"><Calendar size={12} className="text-primary" /> {req.date}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] italic">{req.dept} Node</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                     <span className="text-[10px] font-bold text-accent uppercase tracking-widest shadow-[0_0_10px_rgba(0,210,255,0.4)]">High Priority Signal</span>
                  </div>
                  {isAdminOrFaculty && req.status === 'OPEN' ? (
                    <NeonButton onClick={() => handleAcceptRequest(req.id)} variant="secondary" className="flex-1 md:flex-none border-primary/20 hover:bg-primary/10 hover:text-primary">
                      Initiate Sync <ChevronRight size={16} />
                    </NeonButton>
                  ) : (
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {req.status}
                    </span>
                  )}
                </div>
              </GlassCard>
            ))}
            
            {requests.length === 0 && (
              <div className="p-8 text-center text-white/30 italic glass rounded-[2rem] border border-white/5">
                No active tutoring requests found.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddRequest(false)} />
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-lg glass p-8 rounded-3xl space-y-6">
                <h2 className="text-2xl font-bold italic tracking-tighter">Broadcast Peer Signal</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Topic / Subject Matter</label>
                    <input value={newTopic} onChange={e => setNewTopic(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" placeholder="e.g. Backpropagation Algorithm" />
                  </div>
                </div>
                <button className="w-full btn-primary py-4 justify-center mt-6" onClick={handleBroadcastRequest}>Transmit Request</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tutoring;
