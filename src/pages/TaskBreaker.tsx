import React, { useState, useEffect } from 'react';
import { 
  Timer, Play, Pause, RotateCcw, 
  Zap, CheckCircle2,
  Settings, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const TaskBreaker: React.FC = () => {
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'POMODORO' | 'SHORT' | 'LONG'>('POMODORO');
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tasks/${user.id}`);
      if (res.ok) setTasks(await res.json());
    } catch(e) { console.error(e); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: newTask })
      });
      if (res.ok) {
        setNewTask('');
        setShowAddTask(false);
        fetchTasks();
      }
    } catch(e) { console.error(e); }
  };

  const handleToggleTask = async (id: string, isDone: boolean) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isDone ? 'PENDING' : 'COMPLETED' })
      });
      fetchTasks();
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert('Focus session complete! Take a break.');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'POMODORO' ? 25 * 60 : mode === 'SHORT' ? 5 * 60 : 15 * 60);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 italic tracking-tight">
          <Timer className="text-primary" size={40} /> Task Breaker
        </h1>
        <p className="text-white/40 mt-2 uppercase text-xs font-bold tracking-[0.2em]">Scientific focus cycles for high performance</p>
      </div>

      <div className="glass-card p-12 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-12 border border-white/5">
          {[
            { id: 'POMODORO', label: 'Pomodoro', val: 25 * 60 },
            { id: 'SHORT', label: 'Short Break', val: 5 * 60 },
            { id: 'LONG', label: 'Long Break', val: 15 * 60 },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as any); setTimeLeft(m.val); setIsActive(false); }}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === m.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative group cursor-pointer" onClick={() => setIsActive(!isActive)}>
          <svg className="w-80 h-80 -rotate-90">
            <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle 
              cx="160" 
              cy="160" 
              r="140" 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="12" 
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: timeLeft / (mode === 'POMODORO' ? 25 * 60 : mode === 'SHORT' ? 5 * 60 : 15 * 60) }}
              transition={{ duration: 1 }}
              style={{ filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-7xl font-bold font-mono tracking-tighter shadow-black drop-shadow-lg">{formatTime(timeLeft)}</span>
             <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-4">{isActive ? 'Session Active' : 'Paused'}</p>
          </div>
        </div>

        <div className="flex gap-6 mt-12">
           <button onClick={handleReset} className="w-14 h-14 glass rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 transition-all">
             <RotateCcw size={24} />
           </button>
           <button 
             onClick={() => setIsActive(!isActive)}
             className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 ${isActive ? 'bg-white/10 text-white' : 'bg-primary text-white shadow-primary/40'}`}
           >
             {isActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" className="ml-1" />}
           </button>
           <button className="w-14 h-14 glass rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 transition-all">
             <Settings size={24} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold flex items-center gap-2 mb-6 text-sm uppercase tracking-widest text-white/40">
            <Zap size={16} className="text-yellow-500" /> Focus Objectives
          </h3>
          <div className="space-y-3">
             {tasks.map((task) => (
               <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleToggleTask(task.id, task.status === 'COMPLETED')}>
                 <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-accent border-accent text-white' : 'border-white/20'}`}>
                   {task.status === 'COMPLETED' && <CheckCircle2 size={12} />}
                 </div>
                 <span className={`text-sm ${task.status === 'COMPLETED' ? 'text-white/40 line-through' : ''}`}>{task.title}</span>
               </div>
             ))}
             {tasks.length === 0 && (
               <p className="text-center text-xs text-white/30 italic py-4">No critical target trajectories registered. Plan your protocol.</p>
             )}
          </div>
          <AnimatePresence>
             {showAddTask && (
               <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddTask} className="mt-4 overflow-hidden">
                 <input autoFocus value={newTask} onChange={e => setNewTask(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-sm focus:border-primary/50" placeholder="Encode new objective..." />
               </motion.form>
             )}
          </AnimatePresence>
          <button onClick={() => setShowAddTask(!showAddTask)} className="w-full mt-6 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Add Objective</button>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent">
          <h3 className="font-bold mb-4">Focus Insights</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-end">
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Focus Time</p>
                 <p className="text-2xl font-bold">12h 45m</p>
               </div>
               <div className="flex gap-1 h-12 items-end">
                  {[4,6,10,8,9,5,7].map((h, i) => <div key={i} className="w-2 rounded-t-sm bg-primary/30" style={{ height: `${h * 10}%` }} />)}
               </div>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
                <AlertCircle className="text-primary shrink-0" size={16} />
                <p className="text-[10px] text-white/40 leading-relaxed font-medium">System analysis suggests your peak focus hours are between 10 AM and 12 PM. Plan complex synthesis tasks then.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBreaker;
