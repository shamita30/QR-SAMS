import React, { useState } from 'react';
import { 
  Users, Search, Filter, Mail, 
  MessageSquare, Shield, Clock,
  ChevronRight, UserPlus,
  BookOpen, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const FacultyDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const isHOD = user?.role === 'HOD';
  const [workload, setWorkload] = useState<any[]>([]);

  React.useEffect(() => {
    if (isHOD && user?.department) {
      fetch(`/api/hod/faculty-workload?dept=${user.department}`)
        .then(res => res.json())
        .then(data => setWorkload(data))
        .catch(console.error);
    }
  }, [isHOD, user]);

  const faculty = [
    { id: '1', name: 'Dr. Alan Turing', role: 'Head of CSE', email: 'turing@sentinel.edu', office: 'LH-01', status: 'In Office', rating: 4.9 },
    { id: '2', name: 'Prof. Saravanan', role: 'Senior Lecturer', email: 'saravanan@sentinel.edu', office: 'LH-04', status: 'On Leave', rating: 4.7 },
    { id: '3', name: 'Dr. Emily Brown', role: 'Assistant Professor', email: 'brown.e@sentinel.edu', office: 'LH-02', status: 'Teaching', rating: 4.8 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="text-primary" /> Faculty Directory
          </h1>
          <p className="text-white/50">Official roster of mentors and academic leads</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={() => addToast('Preparing global dispatch...', 'INFO')}
             className="btn-secondary"
          >
             <Mail size={18} /> Global Dispatch
          </button>
          <button 
             onClick={() => addToast('Opening nomination form...', 'LOADING')}
             className="btn-primary"
          >
            <UserPlus size={18} /> Nominate Faculty
          </button>
        </div>
      </div>

      <div className="flex gap-4 p-4 glass rounded-2xl border border-white/10 items-center justify-between">
         <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50" 
              placeholder="Search by name, department, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <button className="btn-secondary py-2 text-xs">
              <Filter size={14} /> Department
            </button>
            <button className="btn-secondary py-2 text-xs">
              <Shield size={14} /> Only Verified
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculty.map((f, idx) => (
          <motion.div 
            key={f.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 flex flex-col gap-6 group hover:border-primary/30 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full ${idx % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`} />
            
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold group-hover:bg-primary/20 group-hover:text-primary transition-all">
                  {f.name.charAt(0)}
               </div>
               <div>
                  <h3 className="font-bold text-lg tracking-tight">{f.name}</h3>
                  <p className="text-xs font-bold text-primary italic uppercase tracking-widest">{f.role}</p>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between text-xs p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/40 flex items-center gap-2"><Mail size={14} /> Email</span>
                  <span className="font-mono text-white/80">{f.email}</span>
               </div>
               <div className="flex items-center justify-between text-xs p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/40 flex items-center gap-2"><BookOpen size={14} /> Office</span>
                  <span className="font-bold">{f.office}</span>
               </div>
               <div className="flex items-center justify-between text-xs p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-white/40 flex items-center gap-2"><Clock size={14} /> Protocol</span>
                  <span className={`font-bold italic uppercase tracking-tighter ${f.status === 'In Office' ? 'text-accent' : f.status === 'Teaching' ? 'text-primary' : 'text-yellow-500'}`}>{f.status}</span>
               </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold">{f.rating}</span>
                  <span className="text-[10px] text-white/20 uppercase tracking-widest ml-1">Ranked</span>
               </div>
               <div className="flex gap-2">
                  <button 
                     onClick={() => addToast(`Opening direct message to ${f.name}`, 'INFO')}
                     className="p-2 glass rounded-lg text-white/40 hover:text-white transition-all"
                  >
                     <MessageSquare size={16} />
                  </button>
                  <button 
                     onClick={() => addToast(`Opening full profile of ${f.name}`, 'LOADING')}
                     className="p-2 glass rounded-lg text-white/40 hover:text-white transition-all"
                  >
                     <ChevronRight size={16} />
                  </button>
               </div>
            </div>

            {/* HOD Faculty Workload Indicator */}
            {isHOD && workload.find(w => w.name === f.name) && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/50">Current Workload</span>
                  <span className={
                    workload.find(w => w.name === f.name)?.status === 'OVERLOADED' ? 'text-red-500' :
                    workload.find(w => w.name === f.name)?.status === 'OPTIMAL' ? 'text-accent' : 'text-primary'
                  }>
                    {workload.find(w => w.name === f.name)?.status}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${workload.find(w => w.name === f.name)?.loadPercent >= 100 ? 'bg-red-500' : 'bg-accent'}`} 
                    style={{ width: `${Math.min(100, workload.find(w => w.name === f.name)?.loadPercent || 0)}%` }} 
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FacultyDirectory;
