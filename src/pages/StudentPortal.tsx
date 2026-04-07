import React from 'react';
import { 
  Trophy, Target, 
  ChevronRight, Brain, Rocket, Clock,
  ArrowUpRight, Layout, Zap, Play,
  Download
} from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const StudentPortal: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [insights, setInsights] = React.useState<any>(null);

  React.useEffect(() => {
    if (user?.id) {
      fetch(`/api/student/${user.id}/insights`)
        .then(res => res.json())
        .then(data => setInsights(data))
        .catch(console.error);
    }
  }, [user]);

  const handleDownloadHistory = () => {
    addToast('Downloading academic history...', 'LOADING');
    setTimeout(() => {
      window.open(`/api/student/${user?.id}/export`, '_blank');
      addToast('Download started successfully!', 'SUCCESS');
    }, 1000);
  };
  return (
    <div className="space-y-8">
      <header className="relative p-10 rounded-[2.5rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/10 to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-4xl shadow-2xl">
            👋
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-white/60 text-lg mt-2">
              {insights ? `You have ${insights.pendingCount} pending items remaining.` : 'Loading insights...'}
            </p>
            <div className="flex gap-4 mt-6">
              <div className="px-4 py-2 glass rounded-2xl flex items-center gap-2">
                <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">4 Day Streak</span>
              </div>
              <div className="px-4 py-2 glass rounded-2xl flex items-center gap-2">
                <Trophy size={16} className="text-primary" />
                <span className="text-sm font-bold">Silver Tier</span>
              </div>
              <button 
                onClick={handleDownloadHistory}
                className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded-2xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download size={16} className="text-white" />
                <span className="text-sm font-bold">Download History</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 italic">
              <Rocket className="text-primary" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-6 group cursor-pointer border-l-4 border-primary">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Note Synthesis • Review</p>
                <h3 className="text-lg font-bold">Cloud Architectures</h3>
                <p className="text-xs text-white/40 mt-1 mb-6">Last synthesized: 2 days ago</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-[#050505]" />)}
                  </div>
                  <ArrowUpRight className="text-white/20 group-hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="glass-card p-6 group cursor-pointer border-l-4 border-secondary">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Soft Skills • Video</p>
                <h3 className="text-lg font-bold">Conflict Mitigation</h3>
                <p className="text-xs text-white/40 mt-1 mb-6">Progress: 12:40 / 15:00</p>
                <div className="flex items-center justify-between">
                  <div className="h-1.5 flex-1 bg-white/5 rounded-full mr-4">
                    <div className="h-full bg-secondary w-3/4 rounded-full" />
                  </div>
                  <Play size={16} className="text-secondary fill-secondary" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 italic">
              <Target className="text-accent" /> Active Projects & Deadlines
            </h2>
            <div className="space-y-4">
              {insights?.upcomingDeadlines?.length > 0 ? (
                insights.upcomingDeadlines.map((proj: any) => (
                  <div key={proj.id} className="glass-card p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center text-accent shrink-0">
                        <Layout size={40} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{proj.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-white/40">Status: <span className="text-accent font-bold">{proj.status}</span></span>
                          <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded">Due: {proj.submission_date}</span>
                        </div>
                        <div className="flex gap-4 mt-6">
                          <button 
                            onClick={() => addToast(`Reminder set for ${proj.title}`, 'SUCCESS')}
                            className="btn-primary flex items-center gap-2"
                          >
                            <Clock size={16} /> Reminder Set
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center text-white/40">No upcoming deadlines! Take a break.</div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="font-bold border-b border-white/10 pb-4 mb-4">Smart Insights</h3>
            {insights ? (
              <div className="space-y-6">
                {[
                  { label: 'Overall Completion', val: insights.overallCompletion, color: '#8b5cf6' },
                  { label: 'Skills Mastery', val: insights.skillsMastery, color: '#10b981' },
                  { label: 'Attendance Score', val: insights.attendanceScore, color: '#ec4899' },
                ].map(stat => (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                      <span>{stat.label}</span>
                      <span>{stat.val || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${stat.val || 0}%`, backgroundColor: stat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-pulse h-32 bg-white/5 rounded-lg" />
            )}
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent">
            <h3 className="font-bold mb-4">Daily Quest</h3>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110">
                <Brain size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Flashcard Sprint</p>
                <p className="text-xs text-white/40 mt-1">Review 10 flashcards in Note Synthesis to earn 50 XP.</p>
                <button 
                  onClick={() => addToast("Quest started! Let's go!", 'INFO')}
                  className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Start Quest <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentPortal;
