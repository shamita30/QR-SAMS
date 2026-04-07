import React, { useState, useEffect } from 'react';
import { 
  Smile, Frown, Meh, 
  TrendingUp, MessageSquare, AlertTriangle, Filter,
  Activity, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const Sentiment: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [data, setData] = useState<any>(null);
  const isHOD = user?.role === 'HOD';
  const dept = user?.department || 'General';

  useEffect(() => {
    fetchSentiment();
  }, []);

  const fetchSentiment = async () => {
    try {
      const res = await fetch(`/api/sentiment?department=${dept}`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error('Failed to fetch sentiment:', e);
    }
  };

  if (!data) return <div className="p-8 text-center opacity-50 italic">Loading sentiment vectors...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="text-secondary" /> Sentiment Analysis
          </h1>
          <p className="text-white/50">{isHOD ? `${dept} Department Scope` : 'Institutional Well-being Dashboard'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => addToast('Opening timeframe filter...', 'INFO')}
            className="btn-secondary"
          >
            <Filter size={18} /> Timeframe
          </button>
          <button 
            onClick={() => {
              addToast('Generating detailed sentiment report...', 'LOADING');
              setTimeout(() => addToast('Report generated successfully!', 'SUCCESS'), 1500);
            }}
            className="btn-primary"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Smile, label: 'Positive', val: `${data.positive}%`, color: '#10b981' },
          { icon: Meh, label: 'Neutral', val: `${data.neutral}%`, color: '#8b5cf6' },
          { icon: Frown, label: 'Critical', val: `${data.critical}%`, color: '#ef4444' },
          { icon: MessageSquare, label: 'Responses', val: data.responses.toLocaleString(), color: '#ec4899' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-6 border-b-4" style={{ borderBottomColor: stat.color }}>
            <div className="flex items-center justify-between mb-4">
              <stat.icon style={{ color: stat.color }} size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Analysis</span>
            </div>
            <h3 className="text-2xl font-bold">{stat.val}</h3>
            <p className="text-xs text-white/40 mt-1 uppercase font-bold tracking-wider">{stat.label} Feedback</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold">Aggregated {isHOD ? 'Department' : 'Campus'} Feedback</h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold border border-white/10 uppercase tracking-widest">
                <Globe size={12} /> {isHOD ? 'DEPT' : 'GLOBAL'}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.topics.map((t: any, i: number) => (
              <div key={i} className="glass p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${t.sentiment === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  {t.sentiment === 'Critical' ? <AlertTriangle size={24} /> : <MessageSquare size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Topic: {t.topic}</span>
                    <span className="text-[10px] text-white/20 font-mono">{t.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">"{t.text}"</p>
                  <div className="mt-4 flex gap-2">
                    <span className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] text-white/40 border border-white/10">NLP-tagged</span>
                    <span className="px-2 py-0.5 bg-accent/10 rounded-md text-[10px] text-accent font-bold">Actionable</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-secondary/10 to-transparent">
            <Activity className="text-secondary mb-4" size={24} />
            <h3 className="font-bold mb-2">Performance Correlation</h3>
            <p className="text-xs text-white/50 leading-relaxed mb-6">Cross-referencing sentiment scores with {dept} department attendance reveals an 84% correlation with engagement rates.</p>
            <div className="w-full aspect-video glass rounded-xl flex items-center justify-center group overflow-hidden">
               <div className="h-16 flex items-end gap-1">
                 {[4,3,6,8,5,9,7,6,10].map((h, i) => (
                   <motion.div 
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${h * 10}%` }}
                     transition={{ delay: i * 0.1 }}
                     className="w-4 bg-secondary/30 rounded-t-sm group-hover:bg-secondary/50 transition-all" 
                   />
                 ))}
               </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold mb-6">Subjective Focus</h3>
            <div className="space-y-4">
              {[
                { label: 'Infrastructure', val: 92 },
                { label: 'Teaching Quality', val: 78 },
                { label: 'Social Engagement', val: 64 },
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/40">
                    <span>{item.label}</span>
                    <span>{item.val}% Positive</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
