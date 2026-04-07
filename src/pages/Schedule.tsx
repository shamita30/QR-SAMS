import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, 
  MapPin, ChevronLeft, ChevronRight,
  Filter, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const Schedule: React.FC = () => {
  const { user } = useAuthStore();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', room: '', type: 'Lecture', color: '#8b5cf6' });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`/api/schedule?dept=${user?.department || 'CSE'}`);
      if (res.ok) setEvents(await res.json());
    } catch (e) {
      console.error('Failed to fetch schedule:', e);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.time) return;
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, dept: user?.department || 'CSE' })
      });
      if (res.ok) {
        setShowAddEvent(false);
        setNewEvent({ title: '', date: '', time: '', room: '', type: 'Lecture', color: '#8b5cf6' });
        fetchSchedule();
      }
    } catch (e) {
      console.error('Failed to add schedule event');
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-primary" /> Sentinel Dispatch
          </h1>
          <p className="text-sm text-white/50">Your hyper-orchestrated academic calendar</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
           <button className="flex-1 lg:flex-none btn-secondary">
             <Filter size={18} /> Viewport
           </button>
           <button onClick={() => setShowAddEvent(true)} className="flex-1 lg:flex-none btn-primary">
             <Plus size={18} /> Add Event
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card flex flex-col p-8">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
             <div className="flex items-center gap-4">
               <h2 className="text-xl md:text-2xl font-bold italic tracking-tight underline decoration-primary decoration-4">March 2026</h2>
               <div className="flex gap-1">
                 <button className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/10"><ChevronLeft size={16} /></button>
                 <button className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/10"><ChevronRight size={16} /></button>
               </div>
             </div>
             <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
                {['Day', 'Week', 'Month'].map(v => (
                  <button key={v} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${v === 'Week' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>{v}</button>
                ))}
             </div>
           </div>

           <div className="flex-1 grid grid-cols-7 gap-2 md:gap-4 overflow-x-auto no-scrollbar">
             {days.map(d => <div key={d} className="text-center text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">{d}</div>)}
             {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className={`aspect-square glass rounded-xl md:rounded-2xl p-1 md:p-3 border border-white/5 group relative hover:border-primary/40 transition-all cursor-pointer ${i + 1 === 17 ? 'ring-1 md:ring-2 ring-primary ring-offset-2 md:ring-offset-4 ring-offset-[#050505]' : 'opacity-40'}`}>
                   <span className={`text-xs md:text-sm font-bold ${i + 1 === 17 ? 'text-primary' : ''}`}>{i + 1}</span>
                   {i + 1 === 17 && (
                     <div className="mt-2 space-y-1">
                        <div className="h-1 bg-primary rounded-full w-3/4 shadow-[0_0_5px_#8b5cf6]" />
                        <div className="h-1 bg-secondary rounded-full w-1/2" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                </div>
             ))}
           </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <Clock size={16} className="text-primary" /> Daily Schedule
            </h3>
            <div className="space-y-4 relative">
              <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/10" />
              {events.map((ev, i) => (
                 <div key={i} className="relative pl-8 group">
                   <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full glass border border-white/10 bg-black flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ev.color }} />
                   </div>
                   <div className="glass p-4 rounded-2xl border-white/5 group-hover:border-white/20 transition-all">
                      <p className="text-[10px] font-bold text-white/40 mb-1">{ev.time} • {ev.type}</p>
                      <h4 className="font-bold text-sm mb-2">{ev.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <MapPin size={10} /> {ev.room}
                      </div>
                   </div>
                 </div>
              ))}
              {events.length === 0 && (
                <p className="text-center text-xs text-white/30 py-8 italic">No events scheduled for today.</p>
              )}
            </div>
            <button className="w-full mt-6 py-4 glass rounded-2xl text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary/10 transition-all">View All Events</button>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-secondary/10 to-transparent">
             <div className="flex items-center gap-3 mb-4">
               <Bell className="text-secondary animate-bounce" size={20} />
               <h3 className="font-bold">Next Alert</h3>
             </div>
             <p className="text-sm font-medium mb-1">Project Milestone: Logic HW</p>
             <p className="text-xs text-white/40">In 2 hours, 14 minutes</p>
             <div className="mt-6 flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-white/40 uppercase">Status</span>
                <span className="text-[10px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full italic">Optimized</span>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddEvent(false)} />
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-lg glass p-6 md:p-8 rounded-3xl space-y-4 md:space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
                <h2 className="text-xl md:text-2xl font-bold italic tracking-tighter">Schedule Synchronization</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Event Subject</label>
                    <input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" placeholder="e.g. Logic Circuit Seminar" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Date</label>
                      <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Sync Time</label>
                      <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Location / Nexus</label>
                    <input value={newEvent.room} onChange={e => setNewEvent({...newEvent, room: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" placeholder="Physical Room or Virtual Link" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Event Type</label>
                    <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50">
                      <option value="Lecture" className="bg-[#050505]">Lecture</option>
                      <option value="Practical" className="bg-[#050505]">Practical</option>
                      <option value="Seminar" className="bg-[#050505]">Seminar</option>
                      <option value="Exam" className="bg-[#050505]">Exam</option>
                    </select>
                  </div>
                </div>
                <button className="w-full btn-primary py-4 justify-center" onClick={handleAddEvent}>Commit to Schedule</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schedule;
