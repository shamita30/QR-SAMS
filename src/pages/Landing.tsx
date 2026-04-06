import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Zap, Target, BookOpen, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NeonButton from '../components/ui/NeonButton';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Real-time Orchestration",
      description: "Instantly synchronize academic schedules, tutoring sessions, and study zones across the entire campus network."
    },
    {
      icon: <Target className="w-8 h-8 text-secondary" />,
      title: "Precision Analytics",
      description: "Track performance, attendance, and soft-skill progression with hyper-accurate node tracking systems."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-accent" />,
      title: "Encrypted Study Arrays",
      description: "Access peer-reviewed study materials, curated roadmaps, and global intelligence briefings securely."
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,#0a1128_0%,#050a1f_100%)] text-white overflow-hidden font-inter relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Shield className="text-primary w-6 h-6" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-wider uppercase">Sentinel Campus</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all duration-300 hidden md:flex items-center gap-2 text-sm uppercase tracking-widest"
          >
            Access Node
          </button>
          <NeonButton onClick={() => navigate('/login')} className="text-sm uppercase tracking-widest py-2.5 px-6">
            Initialize <ArrowRight className="w-4 h-4 ml-1" />
          </NeonButton>
        </div>
      </nav>

      <main className="relative z-40 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-32 pb-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">Protocol v4.0 Active</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-outfit uppercase tracking-tighter leading-[0.9]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary neon-glow">
              Reimagine
            </span>
            <br />
            Academic Flow
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            The centralized nervous system for modern education. Connect nodes, track trajectories, and accelerate knowledge transfer with the world's most advanced campus protocol.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <NeonButton onClick={() => navigate('/login')} className="w-full sm:w-auto py-4 px-10 text-base uppercase tracking-[0.2em]">
              Enter Sentinel <ArrowRight className="w-5 h-5 ml-2" />
            </NeonButton>
            <button className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3">
              <Globe className="w-5 h-5 text-white/40" /> View Architecture
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32"
        >
          {features.map((feature, i) => (
             <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-6">
                   <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                     {feature.icon}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold font-outfit uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                     <p className="text-sm text-white/50 leading-relaxed font-medium">{feature.description}</p>
                   </div>
                </div>
             </div>
          ))}
        </motion.div>

        {/* Global Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-32 border-y border-white/10 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          {[
            { label: 'Active Nodes', val: '14,204' },
            { label: 'Latency', val: '< 12ms' },
            { label: 'Data Modules', val: '86.4K' },
            { label: 'Uptime', val: '99.99%' },
          ].map((stat, i) => (
            <div key={i} className="relative z-10">
              <p className="text-3xl md:text-5xl font-black font-outfit text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{stat.val}</p>
              <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] text-white/40 mt-3">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-40 border-t border-white/5 py-8 text-center bg-black/20 backdrop-blur-xl shrink-0">
        <p className="text-xs text-white/30 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Sentinel Protocol. All systems nominal.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
