import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Building, Camera, ArrowRight, ShieldCheck } from 'lucide-react';
import { handleRegister } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'HOD' | 'ADMIN'>('STUDENT');
  const [department, setDepartment] = useState('CSE');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await handleRegister(email, password, {
        name,
        role,
        department,
        imageUrl: imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      });

      if (result.success) {
        // Mock user for local store
        const user = {
          id: result.user.uid,
          username: email.split('@')[0],
          name,
          role,
          department,
          avatar: imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
        };
        
        login(user, 'firebase-token'); // Update store
        addToast('Protocol established. Account initiated.', 'SUCCESS');
        navigate('/dashboard');
      }
    } catch (error: any) {
      addToast(error.message || 'Verification failed.', 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse" />

      <div className="relative w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 animate-bounce">
              <UserPlus size={32} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Protocol Initiation</h1>
            <p className="text-white/40 uppercase tracking-[0.2em] text-xs font-bold">New Identity Registration • Sentinel Campus</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 col-span-2">
              <div className="relative">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Full Name</label>
                <div className="relative group mt-1">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                   <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="Enter full name..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Institutional Email</label>
                <div className="relative group mt-1">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                   <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="name@sentinel.edu"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Security Cipher</label>
                <div className="relative group mt-1">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                   <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Protocol Role</label>
                <div className="relative group mt-1">
                   <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                   <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium appearance-none"
                  >
                    <option value="STUDENT" className="bg-background">Student</option>
                    <option value="FACULTY" className="bg-background">Faculty</option>
                    <option value="HOD" className="bg-background">HOD</option>
                    <option value="ADMIN" className="bg-background">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Department</label>
                <div className="relative group mt-1">
                   <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                   <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium appearance-none"
                  >
                    <option value="CSE" className="bg-background">CSE</option>
                    <option value="IT" className="bg-background">IT</option>
                    <option value="ECE" className="bg-background">ECE</option>
                    <option value="MECH" className="bg-background">MECH</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 col-span-2">
              <div className="relative">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Identity Visualization (Image URL)</label>
                <div className="relative group mt-1">
                   <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                   <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <p className="text-[9px] text-white/20 mt-2 ml-2 italic">Note: Render static storage is ephemeral. Use external URLs for persistence.</p>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="col-span-2 mt-4 w-full bg-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Processing...' : (
                <>
                  Initiate Sentinel Protocol
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-white/40 text-sm">
            Existing Identity? <Link to="/login" className="text-primary font-bold hover:underline">Access Terminal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
