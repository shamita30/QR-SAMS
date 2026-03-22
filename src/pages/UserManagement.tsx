import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Shield, 
  Trash2, Edit, Camera, Monitor, 
  Eye, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const UserManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'LIST' | 'CCTV'>('LIST');
  
  if (!user) return <div className="p-8 text-center text-red-500">Access Denied. Please log in.</div>;

  const isHOD = user.role === 'HOD';
  const isAdmin = user.role === 'ADMIN';
  const dept = user.department || 'All';

  const [users, setUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({ username: '', name: '', role: 'STUDENT', department: user.department || 'CSE' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const url = isAdmin ? 'http://localhost:3001/api/admin/users' : `http://localhost:3001/api/users${isHOD ? `?dept=${user.department}` : ''}`;
      const res = await fetch(url);
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error('Failed to delete user:', e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ username: '', name: '', role: 'STUDENT', department: user.department || 'CSE' });
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to add user:', e);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`http://localhost:3001/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          role: editingUser.role,
          department: editingUser.department,
          email: editingUser.email
        })
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to update user:', e);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-white/50">{isHOD ? `${dept} Department Operations` : 'Global System Access Control'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('CCTV')}
            className={`btn-secondary ${activeTab === 'CCTV' ? 'bg-primary/20 text-primary border-primary/20' : ''}`}
          >
            <Camera size={18} /> Mock CCTV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <UserPlus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
        <button 
          onClick={() => setActiveTab('LIST')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'LIST' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
        >
          User Registry
        </button>
        <button 
          onClick={() => setActiveTab('CCTV')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'CCTV' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
        >
          Security Feed
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'LIST' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="text" 
                  placeholder={`Search ${isHOD ? dept : 'all'} users...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-primary/50"
                />
              </div>
              <button className="btn-secondary py-2.5">
                <Filter size={18} /> Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase tracking-widest text-white/40 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 font-bold">User Identity</th>
                    <th className="px-6 py-4 font-bold">System Role</th>
                    <th className="px-6 py-4 font-bold">Department</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-white/30 italic">No users found.</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold border border-white/5">
                              {u.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{u.name}</p>
                              <p className="text-xs text-white/40">{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            u.role === 'FACULTY' || u.role === 'HOD' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-secondary/10 text-secondary border border-secondary/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">{u.department}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            Authenticated
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="cctv"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[1, 2, 3, 4].map(id => (
              <div key={id} className="glass-card overflow-hidden group">
                <div className="aspect-video bg-black relative flex items-center justify-center p-4">
                  {/* Mock Camera Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest shadow-black shadow-sm">
                      CAM-0{id} / {dept} DEPT
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/40 z-10">
                    2026-03-17 21:30:{50 + id}
                  </div>
                  <Users size={64} className="text-white/5 group-hover:text-primary/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button className="btn-primary bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/20">
                      <Eye size={18} /> View High-Res
                    </button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-white/40" />
                    <span className="text-xs font-medium text-white/60">Lab Zone {id === 1 ? 'Alpha' : id === 2 ? 'Beta' : 'Corridor'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-accent uppercase flex items-center gap-1">
                    <Shield size={10} /> Active
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md glass p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-bold italic tracking-tighter">Register New Identity</h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Username / ID</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">System Role</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="STUDENT" className="bg-[#050505]">Student</option>
                      <option value="FACULTY" className="bg-[#050505]">Faculty</option>
                      <option value="HOD" className="bg-[#050505]">HOD</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Department</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})}>
                      <option value="CSE" className="bg-[#050505]">CSE</option>
                      <option value="IT" className="bg-[#050505]">IT</option>
                      <option value="ME" className="bg-[#050505]">ME</option>
                      <option value="ECE" className="bg-[#050505]">ECE</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-4 justify-center mt-6">Create Account</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md glass p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-bold italic tracking-tighter">Edit Identity</h2>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">System Role</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                      <option value="STUDENT" className="bg-[#050505]">Student</option>
                      <option value="FACULTY" className="bg-[#050505]">Faculty</option>
                      <option value="HOD" className="bg-[#050505]">HOD</option>
                      <option value="ADMIN" className="bg-[#050505]">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Department</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" value={editingUser.department} onChange={e => setEditingUser({...editingUser, department: e.target.value})}>
                      <option value="CSE" className="bg-[#050505]">CSE</option>
                      <option value="IT" className="bg-[#050505]">IT</option>
                      <option value="ECE" className="bg-[#050505]">ECE</option>
                      <option value="ME" className="bg-[#050505]">ME</option>
                      <option value="CE" className="bg-[#050505]">CE</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-4 justify-center mt-6">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
