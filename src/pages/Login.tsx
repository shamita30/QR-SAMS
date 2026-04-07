import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Mail, Lock, GraduationCap, User, ShieldCheck, Fingerprint } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useAuthStore, UserRole } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { handleLogin as firebaseLogin } from '../lib/firebase';

const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  const roles: { id: UserRole; icon: any; label: string }[] = [
    { id: 'STUDENT', icon: GraduationCap, label: 'Student' },
    { id: 'FACULTY', icon: User, label: 'Faculty' },
    { id: 'ADMIN', icon: ShieldCheck, label: 'Admin' },
    { id: 'HOD', icon: Lock, label: 'HOD' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_50%_50%,#0a1128_0%,#050a1f_100%)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard hover={false} className="relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse" />

          <div className="text-center mb-8 relative z-10">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-block p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <Shield className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-1 font-outfit uppercase">
              Sentinel
            </h1>
            <p className="text-primary/60 font-medium tracking-[0.2em] uppercase text-xs">
              Campus Protocol
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-8">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    role === r.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <r.icon size={14} />
                  {r.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Institutional Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="Enter email access node..."
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Security Cipher</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="Enter decryption key..."
                  />
                </div>
              </div>
            </div>

            <NeonButton type="submit" className={`w-full py-4 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              {loading ? 'Decrypting...' : (
                <>
                  Verify Identity
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </NeonButton>

            <div className="pt-6 border-t border-white/5 text-center">
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                <Fingerprint size={12} /> External Identity Protocol
              </p>
              <p className="text-white/40 text-sm">
                Unregistered Identity? <Link to="/register" className="text-primary font-bold hover:underline">Initiate Registration</Link>
              </p>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
