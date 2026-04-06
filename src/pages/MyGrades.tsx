import React, { useState, useEffect } from 'react';
import { 
  Trophy, BookOpen, Star, Target,
  TrendingUp, Download, Award, ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuthStore } from '../store/useAuthStore';

const MyGrades: React.FC = () => {
  const { user } = useAuthStore();
  const [liveProjects, setLiveProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/projects?studentId=${user.id}`)
        .then(r => r.json())
        .then(data => {
          setLiveProjects(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const sgpa = liveProjects.length > 0 
    ? (liveProjects.reduce((acc, p) => acc + (p.grade || 0), 0) / liveProjects.length / 10).toFixed(2)
    : "8.42"; // default

  const totalCredits = liveProjects.length * 4;

  const colors = ['#8b5cf6', '#10b981', '#ec4899', '#fbbf24'];

  const gpaTrendData = [
    { semester: 'Sem I', gpa: 7.8 },
    { semester: 'Sem II', gpa: 8.1 },
    { semester: 'Sem III', gpa: 8.0 },
    { semester: 'Sem IV', gpa: 8.5 },
    { semester: 'Sem V', gpa: 8.9 },
    { semester: 'Sem VI', gpa: 9.1 },
    { semester: 'Sem VII', gpa: parseFloat(sgpa) || 8.42 }
  ];

  if (loading) return <div className="p-8 text-center text-white/50 animate-pulse">Loading Transcript...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Academic Performance
          </h1>
          <p className="text-white/50">Detailed breakdown of your scholastic achievement</p>
        </div>
        <button className="btn-secondary">
          <Download size={18} /> Export Transcript
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Current SGPA', val: sgpa, icon: Star, color: '#8b5cf6' },
          { label: 'Total Credits', val: String(totalCredits || 24), icon: BookOpen, color: '#10b981' },
          { label: 'Class Rank', val: '12', icon: Target, color: '#ec4899' },
          { label: 'Skills XP', val: '5,420', icon: Award, color: '#fbbf24' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-6">
            <div className="flex items-center justify-between font-bold text-white/40 uppercase tracking-widest text-[10px] mb-4">
              <span>{stat.label}</span>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-bold">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-lg font-bold">Semester VII Results</h2>
            <span className="text-xs text-white/40 font-mono tracking-widest uppercase">Verified Jan 2026</span>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {liveProjects.length > 0 ? liveProjects.map((p, idx) => (
                  <tr key={idx} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5">
                       <span className="font-bold text-sm block">{p.title}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-white/60 uppercase">{p.status}</td>
                    <td className="px-6 py-5">
                       <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-bold text-xs" style={{ color: colors[idx % colors.length] }}>
                         {p.grade && p.grade >= 90 ? 'A+' : p.grade && p.grade >= 80 ? 'A' : p.grade ? 'B' : 'N/A'}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-mono">{p.grade ? (p.grade / 10).toFixed(1) : '-'}</td>
                    <td className="px-6 py-5 text-right">
                       <span className="text-xs font-bold text-accent">
                         +0.2
                       </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-white/30 italic">No project submissions graded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-primary/15 to-transparent flex flex-col">
             <div className="flex items-center gap-3 mb-6">
               <TrendingUp className="text-primary" size={20} />
               <h3 className="font-bold">GPA Trajectory</h3>
             </div>
             
             <div className="flex-1 w-full h-64 min-h-[250px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="semester" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #3b82f640', borderRadius: '12px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                    <Line type="stepAfter" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="glass-card p-6 border-l-4 border-accent">
             <div className="flex items-center gap-3 mb-4">
               <TrendingUp className="text-accent" />
               <h3 className="font-bold">Progress Insight</h3>
             </div>
             <p className="text-sm text-white/60 leading-relaxed">Your consistency in Laboratory sessions has directly impacted your Database Systems score, moving you from the top 15% to the top 5% of the campus.</p>
             <button className="mt-6 text-xs font-bold text-accent hover:underline flex items-center gap-1">Open Detailed Analytics <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGrades;
