import React, { useState } from 'react';
import { 
  Settings, User, Bell, 
  Monitor, Shield, Database,
  Palette, Globe, HardDrive,
  LogOut, Check, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SYSTEM' | 'PRIVACY'>('PROFILE');
  
  const [state, setState] = useState({
    darkMode: true,
    notifications: true,
    biometrics: false,
    syncCloud: true,
  });

  const toggle = (key: keyof typeof state) => {
    setState(s => ({ ...s, [key]: !s[key] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="text-primary" /> Configuration
          </h1>
          <p className="text-white/50">Manage your Sentinel environment and protocol access</p>
        </div>
        <button className="btn-primary">
          <Check size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-2">
           {[
             { id: 'PROFILE', label: 'User Profile', icon: User },
             { id: 'SYSTEM', label: 'System Interface', icon: Monitor },
             { id: 'PRIVACY', label: 'Security & Privacy', icon: Shield },
             { id: 'LOGS', label: 'Audit Logs', icon: Database },
           ].map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id as any)}
               className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all border ${
                 activeTab === item.id 
                   ? 'bg-primary/20 text-primary border-primary/20 shadow-lg shadow-primary/10' 
                   : 'text-white/40 hover:text-white border-transparent hover:bg-white/5'
               }`}
             >
               <item.icon size={20} />
               <span className="font-bold text-sm">{item.label}</span>
             </button>
           ))}
           <div className="pt-8 space-y-2">
             <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group">
               <LogOut size={20} />
               <span className="font-bold text-sm">Deauthorize Terminal</span>
             </button>
           </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
           {activeTab === 'PROFILE' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
               <div className="glass-card p-8 flex items-center gap-8">
                  <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold border-2 border-primary/20 relative group">
                    S
                    <button className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">Edit</button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold italic tracking-tighter">Student Identity</h3>
                    <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">SN-829-XPD-72</p>
                    <div className="flex gap-4 mt-4">
                       <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/60">CSE Department</span>
                       <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/60">Tier: Platinum</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="glass-card p-6 space-y-4">
                   <h4 className="font-bold text-xs uppercase tracking-widest text-white/40">Personal Details</h4>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/20 uppercase">Legal Name</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" defaultValue="Shamita Rathinaraj" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/20 uppercase">Email Protocol</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" defaultValue="shamita@sentinel.edu" />
                      </div>
                   </div>
                 </div>

                 <div className="glass-card p-6 space-y-4">
                   <h4 className="font-bold text-xs uppercase tracking-widest text-white/40">Interests & Specialization</h4>
                   <div className="flex flex-wrap gap-2">
                     {['Cybersecurity', 'Cloud Computing', 'AI Ethics', 'Public Speaking', 'UI Design'].map(t => (
                        <span key={t} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-medium">{t}</span>
                     ))}
                     <button className="px-3 py-1.5 border border-dashed border-white/20 rounded-xl text-xs text-white/30 hover:border-white/50 transition-all">+ Add Interest</button>
                   </div>
                 </div>
               </div>
             </motion.div>
           )}

           {activeTab === 'SYSTEM' && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
               <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-8">Interface Controls</h3>
                  <div className="space-y-8">
                    {[
                      { id: 'darkMode', label: 'Neural Dark Mode', desc: 'Optimized OLED black theme with purple accents', icon: Palette },
                      { id: 'notifications', label: 'Push Directives', desc: 'Receive real-time alerts for schedule and project changes', icon: Bell },
                      { id: 'syncCloud', label: 'Cloud Persistence', desc: 'Automatically sync workspace and notes to central nexus', icon: Globe },
                    ].map(item => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                             <item.icon size={20} />
                           </div>
                           <div>
                             <p className="font-bold text-sm tracking-tight">{item.label}</p>
                             <p className="text-xs text-white/40">{item.desc}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => toggle(item.id as any)}
                          className={`w-14 h-8 rounded-full transition-all relative p-1 ${state[item.id as keyof typeof state] ? 'bg-primary' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            animate={{ x: state[item.id as keyof typeof state] ? 24 : 0 }}
                            className="w-6 h-6 bg-white rounded-full shadow-lg" 
                          />
                        </button>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="glass-card p-8 bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <HardDrive className="text-primary" />
                    <div>
                      <h4 className="font-bold">Local Terminal Storage</h4>
                      <p className="text-xs text-white/40">12.4 MB of cache consumed</p>
                    </div>
                  </div>
                  <button className="btn-secondary py-2 text-xs">Purge Cache</button>
               </div>

               {isAdmin && (
                 <div className="glass-card p-8 border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
                    <h3 className="text-xl font-bold mb-4 text-red-500 flex items-center gap-2"><Database size={20} /> Database Management</h3>
                    <p className="text-sm text-red-400/80 mb-6 leading-relaxed">Create instant back-ups of the primary SQLite engine for disaster recovery. This action locks transactions momentarily.</p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => window.open('/api/admin/backup', '_blank')}
                        className="btn-primary py-3 px-6 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 border-red-400 font-bold"
                      >
                        <Download size={18} /> Download Master Database
                      </button>
                    </div>
                 </div>
               )}
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
