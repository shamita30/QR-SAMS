import React from 'react';
import { 
  Trophy, BookOpen, Star, Target,
  TrendingUp, Download, PieChart, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const MyGrades: React.FC = () => {
  const grades = [
    { subject: 'Cloud Computing', grade: 'A', gpa: 9.2, credits: 4, trend: '+0.4', color: '#8b5cf6' },
    { subject: 'Database Systems', grade: 'A+', gpa: 9.8, credits: 4, trend: '+0.2', color: '#10b981' },
    { subject: 'Web Development', grade: 'B+', gpa: 8.5, credits: 3, trend: '-0.1', color: '#ec4899' },
    { subject: 'Operating Systems', grade: 'A', gpa: 9.0, credits: 4, trend: '+0.5', color: '#fbbf24' },
  ];

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
          { label: 'Current SGPA', val: '9.12', icon: Star, color: '#8b5cf6' },
          { label: 'Total Credits', val: '24', icon: BookOpen, color: '#10b981' },
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
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">GPA</th>
                  <th className="px-6 py-4 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {grades.map((g, idx) => (
                  <tr key={idx} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5">
                       <span className="font-bold text-sm block">{g.subject}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-white/60">{g.credits}</td>
                    <td className="px-6 py-5">
                       <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-bold text-xs" style={{ color: g.color }}>{g.grade}</span>
                    </td>
                    <td className="px-6 py-5 text-sm font-mono">{g.gpa}</td>
                    <td className="px-6 py-5 text-right">
                       <span className={`text-xs font-bold ${g.trend.startsWith('+') ? 'text-accent' : 'text-red-500'}`}>
                         {g.trend}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-primary/15 to-transparent">
             <div className="flex items-center gap-3 mb-6">
               <PieChart className="text-primary" size={20} />
               <h3 className="font-bold">GPA Projection</h3>
             </div>
             <div className="space-y-6">
                <div>
                   <div className="flex justify-between text-xs font-bold uppercase text-white/40 mb-2">
                     <span>Estimated Sem VIII</span>
                     <span>9.4 Peak</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4 rounded-full shadow-[0_0_10px_#8b5cf6]" />
                   </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed italic">System predicts a 12% improvement in Core GPA if Cloud Computing labs are maintained at current engagement levels.</p>
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
