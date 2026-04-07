import React from 'react';
import { 
  FileText, TrendingUp, PieChart, BarChart3,
  Download, Calendar, Shield, Search
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const CollegeReports: React.FC = () => {
  const { user } = useAuthStore();
  const isHOD = user?.role === 'HOD';
  const [activeSegment, setActiveSegment] = React.useState<string>(isHOD ? 'DEPARTMENT' : 'ACADEMIC');
  const [hodAnalytics, setHodAnalytics] = React.useState<any>(null);

  React.useEffect(() => {
    if (isHOD && user?.department) {
      fetch(`/api/hod/analytics?dept=${user.department}`)
        .then(res => res.json())
        .then(data => setHodAnalytics(data))
        .catch(console.error);
    }
  }, [isHOD, user]);

  const handleExport = () => {
    window.open(`/api/reports/export?type=faculty&department=${user?.department || 'CSE'}`);
  };

  const reports = [
    { title: 'S7 Mid-Sem Engagement Analysis', date: 'Mar 15, 2026', type: 'PDF', size: '2.4 MB', priority: 'HIGH' },
    { title: 'Department Faculty Productivity', date: 'Mar 12, 2026', type: 'XLS', size: '1.1 MB', priority: 'MED' },
    { title: 'Campus Safety Audit v3', date: 'Mar 08, 2026', type: 'PDF', size: '5.8 MB', priority: 'CRITICAL' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="text-secondary" /> Administrative Intelligence
          </h1>
          <p className="text-white/50">High-fidelity reports and strategic data visualizations</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
             <Calendar size={18} /> Schedule Report
          </button>
          <button onClick={handleExport} className="btn-primary">
            <Download size={18} /> Master Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Overall Efficiency', val: '94.2%', icon: TrendingUp, trend: '+2.1%', color: '#10b981' },
          { label: 'Resource Utilization', val: '78.5%', icon: PieChart, trend: '-0.5%', color: '#ec4899' },
          { label: 'Administrative Latency', val: '12ms', icon: Shield, trend: 'Optimized', color: '#8b5cf6' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-6 flex flex-col gap-4">
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
               <span>{stat.label}</span>
               <stat.icon size={16} style={{ color: stat.color }} />
             </div>
             <div className="flex items-baseline gap-3">
               <span className="text-3xl font-bold">{stat.val}</span>
               <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-accent' : stat.trend === 'Optimized' ? 'text-primary' : 'text-red-500'}`}>{stat.trend}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <div className="glass-card p-6 space-y-4">
             <h3 className="font-bold text-xs uppercase tracking-widest text-white/40">Report Segments</h3>
             <div className="space-y-2">
               {['ACADEMIC', 'FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', ...(isHOD ? ['DEPARTMENT'] : [])].map(s => (
                 <button 
                  key={s} 
                  onClick={() => setActiveSegment(s as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${activeSegment === s ? 'bg-secondary/10 text-secondary border-secondary/20' : 'text-white/40 hover:text-white border-transparent hover:bg-white/5'}`}
                 >
                   {s}
                 </button>
               ))}
             </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent">
             <div className="flex items-center gap-2 mb-4">
               <Shield className="text-primary" size={18} />
               <h3 className="font-bold text-sm">Security Audit</h3>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter">Your access level: ADMIN-L1. All data downloads are digitally watermarked and logged in the campus blockchain.</p>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                 <h3 className="font-bold text-sm tracking-tight">Recent Dispatches</h3>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                   <input className="bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-secondary/50" placeholder="Filter reports..." />
                 </div>
               </div>
              <div className="divide-y divide-white/5">
                {activeSegment === 'DEPARTMENT' && hodAnalytics ? (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-accent/10">
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Total Students</p>
                      <p className="text-4xl font-bold text-accent mt-2">{hodAnalytics.students}</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-primary/10">
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Total Faculty</p>
                      <p className="text-4xl font-bold text-primary mt-2">{hodAnalytics.faculty}</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-yellow-500/10">
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Avg Attendance</p>
                      <p className="text-4xl font-bold text-yellow-500 mt-2">{hodAnalytics.avgAttendance}%</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-green-500/10">
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Project Completion</p>
                      <p className="text-4xl font-bold text-green-500 mt-2">{hodAnalytics.projCompletion}%</p>
                    </div>
                  </div>
                ) : (
                  reports.map((r, i) => (
                    <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-secondary group-hover:border-secondary/20 transition-all">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{r.title}</h4>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{r.date} • {r.size} • {r.type}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${r.priority === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-400' : r.priority === 'HIGH' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-white/5 border-white/10 text-white/40'}`}>{r.priority}</span>
                          <button onClick={handleExport} className="p-2 glass rounded-lg text-white/20 hover:text-white transition-all">
                            <Download size={16} />
                          </button>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeReports;
