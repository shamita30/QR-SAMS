import React, { useState } from 'react';
import { Shield, ArrowRight, User, GraduationCap, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { useAuthStore, UserRole } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Welcome back, ${data.user.name}`, 'SUCCESS');
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        addToast(data.error || 'Identity verification failed.', 'ERROR');
      }
    } catch (e) {
      addToast('Network node unreachable.', 'ERROR');
    }
  };

  const handleQuickLogin = async (selectedRole: UserRole) => {
    setRole(selectedRole);
    // Map roles to their actual seeded usernames in the database
    const usernameMap: Record<UserRole, string> = {
      STUDENT: 'student',
      FACULTY: 'faculty',
      ADMIN: 'admin',
      HOD: 'hod'
    };
    const u = usernameMap[selectedRole] || selectedRole.toLowerCase();
    const pwd = 'password';
    setUsername(u);
    setPassword(pwd);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: pwd })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Welcome back, ${data.user.name}`, 'SUCCESS');
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        addToast(data.error || 'Identity verification failed.', 'ERROR');
      }
    } catch (e) {
      addToast('Network node unreachable.', 'ERROR');
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
          {/* Background Glow */}
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

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Role Selector */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-8">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-300 ${
                    role === r.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <r.icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-11"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
            </div>

            <NeonButton type="submit" className="w-full py-4 uppercase tracking-[0.2em] text-sm">
              Enter Sentinel <ArrowRight className="w-4 h-4 ml-1" />
            </NeonButton>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">
              Quick Login Support
            </p>
            <div className="flex justify-center flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleQuickLogin(r.id)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/40 hover:text-primary hover:border-primary/40 transition-all font-bold"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
