import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Mail, Lock, GraduationCap, User, ShieldCheck, Fingerprint, Terminal, Zap, Code2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useAuthStore, UserRole } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { handleLogin as firebaseLogin } from '../lib/firebase';

// Demo accounts for quick access
const demoAccounts: { role: UserRole; name: string; icon: any; color: string; description: string }[] = [
  { role: 'STUDENT', name: 'Alex Student', icon: GraduationCap, color: 'from-primary to-punch-yellow', description: 'Student Portal' },
  { role: 'FACULTY', name: 'Dr. Sarah Faculty', icon: Code2, color: 'from-secondary to-primary', description: 'Faculty Dashboard' },
  { role: 'ADMIN', name: 'System Admin', icon: Terminal, color: 'from-accent to-punch-yellow', description: 'Admin Control' },
  { role: 'HOD', name: 'Prof. HOD', icon: ShieldCheck, color: 'from-punch-yellow to-primary', description: 'HOD Overview' },
];

const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await firebaseLogin(email, password);
      
      if (result.success && result.profile) {
        login({
          id: result.user.uid,
          username: email.split('@')[0],
          name: result.profile.name,
          role: result.profile.role,
          department: result.profile.department,
          avatar: result.profile.imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${result.profile.name}`
        }, 'firebase-token');
        
        addToast('Identity verified. Welcome back.', 'SUCCESS');
        navigate('/dashboard');
      } else if (result.success) {
        // Fallback for users without RTDB profiles
        login({
          id: result.user.uid,
          username: email.split('@')[0],
          name: email.split('@')[0],
          role: 'STUDENT',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`
        }, 'firebase-token');
        addToast('Identity verified. Redirecting to Dashboard.', 'INFO');
        navigate('/dashboard');
      }
    } catch (error: any) {
      addToast(error.message || 'Authentication sequence failed.', 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    login({
      id: `demo_${account.role.toLowerCase()}_1`,
      username: `demo_${account.role.toLowerCase()}`,
      name: account.name,
      role: account.role,
      department: 'Computer Science',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${account.name}`
    }, 'demo-token');
    addToast(`Demo Mode: ${account.name} • ${account.description}`, 'SUCCESS');
    navigate('/dashboard');
  };

  const roles: { id: UserRole; icon: any; label: string }[] = [
    { id: 'STUDENT', icon: GraduationCap, label: 'Student' },
    { id: 'FACULTY', icon: User, label: 'Faculty' },
    { id: 'ADMIN', icon: ShieldCheck, label: 'Admin' },
    { id: 'HOD', icon: Lock, label: 'HOD' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_30%_0%,#1a1020_0%,#0a0e1a_50%,#080c16_100%)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Floating code snippets */}
      {['const auth = await verify();', 'if (access) redirect("/dash");', 'return { token, user };'].map((code, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-[9px] text-primary/15 pointer-events-none whitespace-nowrap"
          style={{ left: `${10 + i * 30}%`, top: `${20 + i * 25}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {code}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard hover={false} className="relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/15 rounded-full blur-3xl animate-pulse" />

          <div className="text-center mb-8 relative z-10">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-block p-4 rounded-2xl bg-primary/10 border border-primary/30 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            >
              <Shield className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-1 font-outfit uppercase">
              Sentinel
            </h1>
            <p className="text-primary/60 font-mono tracking-[0.2em] uppercase text-xs">
              Campus Protocol
            </p>
          </div>

          {!showDemo ? (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-8">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                      role === r.id ? 'bg-gradient-to-r from-primary to-punch-yellow text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <r.icon size={14} />
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2 font-mono">Email Access</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                      placeholder="Enter email..."
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2 font-mono">Security Key</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                      placeholder="Enter password..."
                    />
                  </div>
                </div>
              </div>

              <NeonButton className={`w-full py-4 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading ? 'Authenticating...' : (
                  <>
                    <Zap size={16} /> Verify Identity
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </NeonButton>

              {/* Demo Login Button */}
              <button
                type="button"
                onClick={() => setShowDemo(true)}
                className="w-full py-3 bg-gradient-to-r from-primary/10 to-punch-yellow/10 border border-primary/20 rounded-xl text-sm font-bold text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2 group"
              >
                <Terminal size={14} className="group-hover:rotate-12 transition-transform" />
                Quick Demo Access
                <span className="text-[9px] text-primary/50 uppercase tracking-widest font-mono">No signup needed</span>
              </button>

              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4 flex items-center justify-center gap-2 font-mono">
                  <Fingerprint size={12} /> External Auth Protocol
                </p>
                <p className="text-white/40 text-sm">
                  No account? <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
                </p>
              </div>
            </form>
          ) : (
            /* Demo Login Panel */
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Terminal size={14} className="text-primary" /> Select Demo Portal
                </h3>
                <button
                  onClick={() => setShowDemo(false)}
                  className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-mono transition-colors"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {demoAccounts.map((account) => (
                  <motion.button
                    key={account.role}
                    onClick={() => handleDemoLogin(account)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all flex items-center gap-4 text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center shadow-lg`}>
                      <account.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{account.name}</p>
                      <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{account.description} • {account.role}</p>
                    </div>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>

              <div className="text-center pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                  Demo mode • Data resets on refresh
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
