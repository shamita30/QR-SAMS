import React, { useState } from 'react';
import { 
  Search, Filter, Download,
  MoreVertical, UserPlus,
  AlertTriangle, Database
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const StudentDatabase: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);

  React.useEffect(() => {
    fetch(`http://localhost:3001/api/users?dept=${user?.department || 'CSE'}`)
      .then(res => res.json())
      .then(data => {
        const studentUsers = data.filter((u: any) => u.role === 'STUDENT');
        setStudents(studentUsers.map((u: any) => ({
          ...u,
          roll: u.username,
          dept: u.department,
          attendance: Math.floor(Math.random() * (100 - 75 + 1) + 75), // UI placeholder enhancement
          gpa: (Math.random() * (10 - 7) + 7).toFixed(1), // UI placeholder enhancement
          status: 'Active'
        })));
      })
      .catch(console.error);
  }, [user]);

  const handleExport = () => {
    window.open(`http://localhost:3001/api/reports/export?type=students&department=${user?.department || 'CSE'}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="text-accent" /> Student Sovereign
          </h1>
          <p className="text-white/50">Master registry and performance analytics of the student body</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary">
             <Download size={18} /> Bulk Report
          </button>
          <button className="btn-primary">
            <UserPlus size={18} /> Enroll Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 space-y-8">
               <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 italic">Registry Status</h3>
               <div className="space-y-6">
                  {[
                    { label: 'Total Enrolled', val: '1,240', color: '#8b5cf6' },
                    { label: 'On Analytics', val: '942', color: '#10b981' },
                    { label: 'Requiring Action', val: '14', color: '#ef4444' },
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                         <span className="text-white/40">{s.label}</span>
                         <span style={{ color: s.color }}>{s.val}</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ backgroundColor: s.color, width: '60%' }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass-card p-6 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
               <div className="flex items-center gap-2 mb-3">
                 <AlertTriangle size={18} className="text-red-400" />
                 <h3 className="font-bold text-sm">Critical Watch</h3>
               </div>
               <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-tight mb-4">4 students dropped below 75% attendance in the last 24 hours.</p>
               <button className="w-full btn-secondary border-red-500/20 text-red-400 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-widest py-2">Open Alert Board</button>
            </div>
         </div>

         <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent/40" placeholder="Filter by name, roll, dept..." />
              </div>
              <button className="glass px-6 rounded-2xl border-white/10 hover:border-white/20">
                <Filter size={20} className="text-white/60" />
              </button>
            </div>

            <div className="glass-card overflow-hidden p-0">
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                     <tr>
                        <th className="px-6 py-4">Student Identity</th>
                        <th className="px-6 py-4">Dept</th>
                        <th className="px-6 py-4">Attendance</th>
                        <th className="px-6 py-4">Current GPA</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {students.map((s, idx) => (
                       <tr key={idx} className="group hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-accent group-hover:bg-accent/10 transition-all">
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-bold text-sm tracking-tight">{s.name}</p>
                                   <p className="text-[10px] text-white/40 font-mono tracking-tighter">{s.roll}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-xs font-bold text-white/60">{s.dept}</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <div className="flex-1 w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                   <div className={`h-full rounded-full ${s.attendance < 80 ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-primary'}`} style={{ width: `${s.attendance}%` }} />
                                </div>
                                <span className="text-xs font-bold hidden xl:inline">{s.attendance}%</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm">{s.gpa}</td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${s.status === 'Probation' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-accent/10 border-accent/20 text-accent'}`}>{s.status.toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="p-2 text-white/20 hover:text-white transition-all">
                               <MoreVertical size={16} />
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StudentDatabase;
