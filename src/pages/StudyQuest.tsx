import React, { useState } from 'react';
import { 
  Compass, Target, Rocket, 
  Lock, CheckCircle2,
  Gift, Zap, Star, Brain, X, Sparkles, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';

const StudyQuest: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showShop, setShowShop] = useState(false);

  const questPath = [
    { id: 1, label: 'The Gates', icon: Target, status: 'COMPLETED', pos: { x: 10, y: 50 }, topic: 'Core Protocols' },
    { id: 2, label: 'Syntax Valley', icon: Brain, status: 'COMPLETED', pos: { x: 30, y: 30 }, topic: 'Memory Vectors' },
    { id: 3, label: 'The Nexus', icon: Zap, status: 'ACTIVE', pos: { x: 50, y: 50 }, topic: 'Distributed Sync' },
    { id: 4, label: 'Echo Peak', icon: Compass, status: 'LOCKED', pos: { x: 70, y: 70 }, topic: 'Security Shards' },
    { id: 5, label: 'The Citadel', icon: Rocket, status: 'LOCKED', pos: { x: 90, y: 50 }, topic: 'Final Integration' },
  ];

  return (
    <div className="h-full flex flex-col space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
            Study Quest
          </h2>
          <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
            Academic Odyssey
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            Visualize your progress through the Sentinel sectors and unlock specialized perks.
          </p>
        </div>
        <div className="flex gap-4">
          <NeonButton variant="secondary" onClick={() => setShowShop(true)} className="pr-8 border-secondary/20 hover:bg-secondary/10">
            <Gift size={20} className="text-secondary" /> Perks Vault
          </NeonButton>
          
          <GlassCard hover={false} className="py-2 px-6 border-accent/20 bg-accent/5 flex items-center gap-3">
              <Star size={20} fill="currentColor" className="text-accent" />
              <div>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mb-1">XP Balance</p>
                 <p className="text-lg font-bold text-white leading-none">2,850</p>
              </div>
           </GlassCard>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 glass rounded-[3rem] p-12 relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#0a1128_0%,#050a1f_100%)] border-white/5 shadow-inner min-h-[500px]">
        {/* SVG Path Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d="M 10 50 Q 20 30, 30 30 T 50 50 T 70 70 T 90 50" 
            fill="none" 
            stroke="white" 
            strokeWidth="3" 
            strokeDasharray="10 10"
            className="neon-glow"
          />
        </svg>

        {/* Quest Nodes */}
        {questPath.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 }}
            style={{ left: `${node.pos.x}%`, top: `${node.pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="flex flex-col items-center group">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedNode(node)}
                disabled={node.status === 'LOCKED'}
                className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-2xl transition-all duration-500 border-4 relative shadow-2xl ${
                  node.status === 'COMPLETED' ? 'bg-accent/20 border-accent/40 text-accent group-hover:bg-accent/30' :
                  node.status === 'ACTIVE' ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)] text-white hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]' :
                  'bg-white/5 border-white/10 text-white/10 grayscale cursor-not-allowed'
                }`}
              >
                {node.status === 'COMPLETED' ? <CheckCircle2 size={36} className="shadow-[0_0_10px_rgba(0,210,255,0.4)]" /> : <node.icon size={36} />}
                
                {node.status === 'ACTIVE' && (
                  <div className="absolute -top-14 px-4 py-1.5 bg-primary text-white text-[9px] font-bold rounded-xl uppercase tracking-[0.2em] italic shadow-lg shadow-primary/30 border border-primary-hover animate-bounce">
                    Active Sync
                  </div>
                )}

                {node.status === 'LOCKED' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem] backdrop-blur-[2px]">
                     <Lock size={20} className="text-white/20" />
                  </div>
                )}
              </motion.button>
              
              <div className="mt-6 text-center">
                <p className={`text-sm font-bold tracking-tighter mb-1 uppercase ${node.status === 'LOCKED' ? 'text-white/10' : 'text-white/80'}`}>{node.label}</p>
                <div className={`text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                  node.status === 'COMPLETED' ? 'text-accent border-accent/20 bg-accent/5' :
                  node.status === 'ACTIVE' ? 'text-primary border-primary/20 bg-primary/5' :
                  'text-white/5 border-white/5'
                }`}>
                  {node.topic}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setSelectedNode(null)} />
             <motion.div 
               initial={{ scale: 0.9, y: 40, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }} 
               exit={{ scale: 0.9, y: 40, opacity: 0 }} 
               className="relative w-full max-w-lg glass p-10 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
             >
                <div className="flex items-center gap-6 mb-8">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 ${selectedNode.status === 'COMPLETED' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                    <selectedNode.icon size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-outfit uppercase tracking-tighter">{selectedNode.label}</h2>
                    <p className="text-primary/60 uppercase text-[10px] font-bold tracking-[0.3em]">{selectedNode.topic}</p>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="p-8 bg-white/2 rounded-[2rem] border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
                         <Activity size={80} />
                      </div>
                      <h4 className="font-bold text-[10px] uppercase text-white/30 tracking-[0.3em] mb-6 flex items-center gap-2">
                         <Sparkles size={14} className="text-primary" /> Sector Requirements
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: 'Note Synthesis Review', value: '100%', status: 'COMPLETED' },
                          { label: 'Practical Lab Hours', value: '12/12', status: 'COMPLETED' },
                          { label: 'Weekly Quiz Protocol', value: 'PENDING', status: 'ACTIVE' }
                        ].map((req, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/50 italic">{req.label}</span>
                            <span className={`text-xs font-bold uppercase tracking-widest ${req.status === 'COMPLETED' ? 'text-accent' : 'text-primary animate-pulse'}`}>
                              {req.value}
                            </span>
                          </div>
                        ))}
                      </div>
                   </div>
                   
                   <div className="flex gap-4">
                      <NeonButton className="flex-1 py-4 uppercase tracking-[0.2em] text-xs" onClick={() => setSelectedNode(null)}>
                         {selectedNode.status === 'COMPLETED' ? 'Review Segment' : 'Initiate Challenge'}
                      </NeonButton>
                      <button onClick={() => setSelectedNode(null)} className="p-4 glass rounded-2xl text-white/40 hover:text-white transition-all">
                         <X size={20} />
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Perks Shop Slide-out */}
      <AnimatePresence>
        {showShop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowShop(false)} />
             <motion.div 
               initial={{ x: 500, opacity: 0 }} 
               animate={{ x: 0, opacity: 1 }} 
               exit={{ x: 500, opacity: 0 }} 
               className="relative w-full max-w-md h-full max-h-[90vh] glass rounded-[3rem] p-12 flex flex-col border-secondary/20 shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -rotate-12">
                   <Gift size={160} className="text-secondary" />
                </div>

                <div className="flex items-center justify-between mb-10 relative z-10">
                   <div>
                     <h2 className="text-2xl font-bold font-outfit uppercase italic tracking-tighter flex items-center gap-3">
                       <Gift className="text-secondary" /> Perks Vault
                     </h2>
                     <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Acquire specialized node augmentations</p>
                   </div>
                   <button onClick={() => setShowShop(false)} className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10 text-white/40 transition-all">
                     <X size={20} />
                   </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                  {[
                    { title: 'Neon Pulse Theme', cost: 500, icon: Sparkles, color: '#3b82f6', desc: 'Futuristic UI override' },
                    { title: 'Attendance Token', cost: 1500, icon: CheckCircle2, color: '#a855f7', desc: 'Protocol override (1x)' },
                    { title: 'Neural Quiz Booster', cost: 250, icon: Brain, color: '#00d2ff', desc: 'Extra sync attempt' },
                    { title: 'Citadel Avatar Key', cost: 800, icon: Rocket, color: '#f59e0b', desc: 'Legendary visual tier' },
                  ].map((item, idx) => (
                    <GlassCard key={idx} className="p-6 border-white/5 hover:border-secondary/20 relative group overflow-hidden" hover={true}>
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-lg" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                           <div className="absolute inset-0 bg-white/5 animate-pulse rounded-2xl" />
                           <item.icon size={26} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-white group-hover:text-secondary transition-colors uppercase tracking-tight">{item.title}</p>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5 italic">{item.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-secondary mb-2">{item.cost} XP</p>
                          <button className="text-[9px] font-bold uppercase text-white/20 group-hover:text-secondary py-1.5 px-4 border border-white/10 group-hover:border-secondary/30 rounded-full transition-all bg-white/2">Purchase</button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                   <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-[0_0_10px_rgba(0,210,255,0.3)]">
                         <Star size={20} fill="currentColor" />
                      </div>
                      <div>
                         <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Available Yield</p>
                         <p className="text-lg font-bold text-white leading-none">2,850 XP</p>
                      </div>
                   </div>
                   <button className="p-3 glass rounded-xl text-white/40 hover:text-white transition-all">
                      <Activity size={20} />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyQuest;
