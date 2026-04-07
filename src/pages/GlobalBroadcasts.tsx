import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Shield, Send, AlertCircle, Trash2, Zap, Radio
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuthStore } from '../store/useAuthStore';

const GlobalBroadcasts: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [messages, setMessages] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('INFO');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/broadcasts');
      if (res.ok) setMessages(await res.json());
    } catch (e) {
      console.error('Failed to fetch broadcasts');
    }
  };

  const handlePublish = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsPublishing(true);
    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          message: newContent,
          author: user?.name,
          roleTarget: newType
        })
      });
      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        fetchBroadcasts();
      }
    } catch (e) {
      console.error('Failed to publish broadcast');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Radio className="text-secondary animate-pulse" /> Global Broadcast
          </h1>
          <p className="text-white/50">Disseminate critical directives across the campus network</p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary">
             <Shield size={18} /> Protocol Logs
           </button>
           <button className="btn-primary">
             <Megaphone size={18} /> New Broadcast
           </button>
        </div>
      </div>

      {isAdmin && (
        <div className="glass-card p-10 bg-gradient-to-br from-secondary/15 to-transparent space-y-8">
           <h2 className="text-2xl font-bold tracking-tighter italic">Emergency Dispatch Terminal</h2>
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Broadcast Title</label>
                 <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-secondary/50 font-bold" placeholder="e.g. S7 Lab Attendance Override" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Message Context</label>
                 <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-secondary/50 resize-none font-medium" placeholder="Compose high-priority directive..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                 {['INFO', 'WARNING', 'EMERGENCY'].map((v) => (
                   <button key={v} onClick={() => setNewType(v)} className={`p-4 rounded-xl border text-[10px] font-bold tracking-widest transition-all ${newType === v ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/20 hover:text-white'}`}>
                     {v}
                   </button>
                 ))}
              </div>
           </div>
           <button onClick={handlePublish} disabled={isPublishing || !newTitle || !newContent} className="w-full btn-primary py-5 rounded-2xl text-lg justify-center font-bold bg-secondary hover:bg-secondary/80 shadow-2xl shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPublishing ? 'Transmitting...' : 'Publish to All Nodes'} <Send className="ml-2" size={20} />
           </button>
        </div>
      )}

      <div className="space-y-6">
         <div className="flex items-center justify-between">
           <h3 className="font-bold text-white/40 uppercase tracking-widest text-xs">Active Transmissions</h3>
           <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
             <button onClick={() => setActiveTab('ACTIVE')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>NOW</button>
             <button onClick={() => setActiveTab('HISTORY')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>ARCHIVE</button>
           </div>
         </div>

         <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-white/30 italic glass rounded-[2rem] border border-white/5">
                No active broadcasts at this time.
              </div>
            ) : messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-6 rounded-[2rem] border-white/5 flex items-start gap-6 relative overflow-hidden group hover:border-secondary/30 transition-all"
              >
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${msg.role_target === 'EMERGENCY' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                   {msg.role_target === 'EMERGENCY' ? <AlertCircle size={24} /> : <Zap size={24} />}
                </div>
                <div className="flex-1 space-y-1">
                   <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg leading-tight tracking-tight">{msg.title}</h4>
                      <span className="text-[10px] text-white/20 font-mono italic">{new Date(msg.timestamp).toLocaleString()}</span>
                   </div>
                   <p className="text-sm text-white/60 leading-relaxed font-medium">{msg.message}</p>
                   <div className="flex gap-3 pt-3">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${msg.role_target === 'EMERGENCY' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>{msg.role_target} PRIORITY</span>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-white/5 border border-white/10 text-white/30 uppercase tracking-widest">Authorized by {msg.author}</span>
                   </div>
                </div>
                {isAdmin && (
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default GlobalBroadcasts;
