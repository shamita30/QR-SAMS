import React, { useState } from 'react';
import { 
  Plus, Coffee, Calendar, Clock, 
  Users, MessageSquare, ScreenShare,
  Mic, Video, PhoneOff, Send,
  Activity, Shield, ChevronRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';

const lounges = [
  { id: '101', title: 'Data Structures Sprint', host: 'Student A', members: 4, date: 'Mar 18', time: '22:00', tags: ['Core', 'Problem Solving'], live: true },
  { id: '202', title: 'Algorithm Complexity Study', host: 'Student B', members: 2, date: 'Mar 18', time: '14:00', tags: ['Math', 'Theory'], live: true },
  { id: '303', title: 'React Performance Audit', host: 'Dev Node', members: 7, date: 'Mar 19', time: '11:00', tags: ['Web', 'Performance'], live: false },
];

const StudyLounges: React.FC = () => {
  const [activeRoom, setActiveRoom] = useState<any>(null);

  return (
    <div className="space-y-8 pb-12">
      {!activeRoom ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
                Study Lounges
              </h2>
              <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
                Virtual Hubs
              </h1>
              <p className="text-white/40 mt-2 font-medium">
                Initialize secure peer-learning sessions and knowledge transfers.
              </p>
            </div>
            <NeonButton className="pr-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Plus size={18} /> Provision New Room
            </NeonButton>
          </div>

          {/* Filters */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
             {['All Sessions', 'Live Only', 'My Department', 'Private Segments'].map((f, i) => (
               <button key={f} className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border shrink-0 ${i === 0 ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                  {f}
               </button>
             ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lounges.map((room, i) => (
              <GlassCard key={room.id} delay={i * 0.1}>
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                       <Coffee size={24} />
                    </div>
                    {room.live ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full shadow-[0_0_10px_rgba(0,210,255,0.2)]">
                         <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                         <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Live Node</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                         <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Scheduled</span>
                      </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <div>
                       <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors tracking-tight uppercase leading-tight">{room.title}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-white/40 font-medium">Host: <span className="text-white/60">{room.host}</span></p>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] text-white/30 font-mono italic">#{room.id}</span>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {room.tags.map(tag => (
                         <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-white/30 uppercase tracking-widest">
                           {tag}
                         </span>
                       ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Next Shift</p>
                          <p className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                             <Calendar size={12} className="text-primary" /> {room.date}
                          </p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Duration</p>
                          <p className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                             <Clock size={12} className="text-primary" /> {room.time}
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2">
                             {[1, 2, 3].map(i => (
                               <div key={i} className="w-7 h-7 rounded-lg bg-white/5 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white/20 overflow-hidden">
                                  <Users size={12} />
                               </div>
                             ))}
                          </div>
                          <span className="text-[10px] font-bold text-white/40 tracking-tighter">+{room.members} Active</span>
                       </div>
                       <button onClick={() => setActiveRoom(room)} className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all">
                          <ChevronRight size={18} />
                       </button>
                    </div>
                 </div>
              </GlassCard>
            ))}
          </div>

          {/* Secure Channel Alert */}
          <GlassCard className="border-accent/10 bg-accent/5" hover={false}>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                   <Shield size={24} />
                </div>
                <div className="flex-1">
                   <h4 className="text-white font-bold uppercase tracking-wider">Protocol: Secure Peer-to-Peer</h4>
                   <p className="text-xs text-white/40 mt-0.5 uppercase tracking-widest font-medium">All sessions are end-to-end encrypted under Sentinel Protocol v3.0</p>
                </div>
                <Activity size={24} className="text-accent/20 animate-pulse" />
             </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[calc(100vh-14rem)] grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Active Room View would go here - simplified for current task */}
          <GlassCard className="lg:col-span-3 bg-black/40 flex items-center justify-center relative overflow-hidden" hover={false}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
             <div className="text-center space-y-8 relative z-10">
                <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/20 p-1 mx-auto relative group">
                   <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" />
                   <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-primary text-5xl font-outfit font-bold">
                      {activeRoom.host.charAt(0)}
                   </div>
                   <div className="absolute -bottom-2 right-0 w-8 h-8 rounded-full bg-accent border-4 border-background flex items-center justify-center text-white">
                      <Mic size={14} />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-bold uppercase tracking-tighter">{activeRoom.title}</h3>
                   <div className="flex items-center justify-center gap-4 mt-2">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] flex items-center gap-1.5"><Activity size={12} /> Secure Stream Active</span>
                      <span className="text-[10px] font-mono text-white/20">00:42:15</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-6 justify-center">
                   <button className="w-14 h-14 rounded-2xl glass hover:bg-white/10 flex items-center justify-center text-white/60 transition-all">
                      <Mic size={24} />
                   </button>
                   <button className="w-14 h-14 rounded-2xl glass hover:bg-white/10 flex items-center justify-center text-white/60 transition-all">
                      <Video size={24} />
                   </button>
                   <button className="w-14 h-14 rounded-2xl glass hover:bg-white/10 flex items-center justify-center text-white/60 transition-all">
                      <ScreenShare size={24} />
                   </button>
                   <button onClick={() => setActiveRoom(null)} className="w-16 h-16 rounded-2xl bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center text-white transition-all ml-4">
                      <PhoneOff size={28} />
                   </button>
                </div>
             </div>
          </GlassCard>

          <div className="flex flex-col gap-6">
             <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col" hover={false}>
                <div className="p-4 border-b border-white/5 bg-white/2">
                   <h4 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest text-primary">
                      <MessageSquare size={14} /> Room Intelligence
                   </h4>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto font-mono text-[10px] text-white/30">
                   <p className="italic text-center py-2 opacity-50">Secure channel initialized...</p>
                   <div className="space-y-1">
                      <span className="text-primary font-bold">{activeRoom.host}:</span>
                      <p className="text-white/60">Does anyone have the encrypted segment for Chapter 4?</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-secondary font-bold">Node_04:</span>
                      <p className="text-white/60">Checking the Study Area now. Will broadcast shortly.</p>
                   </div>
                </div>
                <div className="p-4 border-t border-white/5">
                   <div className="relative">
                      <input className="w-full bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-[10px] outline-none placeholder:text-white/10 focus:border-primary/40 transition-all" placeholder="Broadcast to members..." />
                      <Send className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" size={14} />
                   </div>
                </div>
             </GlassCard>
             
             <GlassCard hover={false} className="p-4 border-primary/20 bg-primary/2">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                   <Zap size={10} className="text-primary" /> Connected Nodes
                </h4>
                <div className="space-y-2">
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Identity_Sec_0{i}</span>
                     </div>
                   ))}
                </div>
             </GlassCard>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudyLounges;
