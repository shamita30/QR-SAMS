import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  QrCode, BookOpen, Video, Award, 
  Map as MapIcon, Timer, Calendar, BarChart2, 
  Settings, LogOut, MessageSquare, Coffee,
  Database, FileText, LayoutDashboard, Brain
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const isHOD = user.role === 'HOD';
  const isAdmin = user.role === 'ADMIN';
  const isStudent = user.role === 'STUDENT';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Portal', path: '/portal', show: isStudent },
    { icon: BookOpen, label: 'Note Synthesis', path: '/notes', show: true },
    { icon: Video, label: 'Soft Skills', path: '/soft-skills', show: true },
    { icon: Coffee, label: 'Study Lounges', path: '/study-lounges', show: isStudent },
    { icon: Brain, label: 'Peer Tutoring', path: '/tutoring', show: isStudent },
    { icon: Award, label: 'Skill Badges', path: '/badges', show: isStudent },
    { icon: MapIcon, label: 'Study Quest', path: '/quest', show: isStudent },
    
    // Faculty / HOD
    { icon: QrCode, label: 'Attendance', path: '/attendance', show: !isStudent },
    { icon: Database, label: 'User Management', path: '/users', show: isHOD || isAdmin },
    { icon: BarChart2, label: 'Sentiment Analysis', path: '/sentiment', show: isHOD || isAdmin },
    { icon: FileText, label: 'Projects', path: '/projects', show: true },
    
    // Global
    { icon: Timer, label: 'Task Breaker', path: '/task-breaker', show: true },
    { icon: Calendar, label: 'Schedule', path: '/schedule', show: true },
    { icon: BarChart2, label: 'Leaderboard', path: '/leaderboard', show: true },
    { icon: MessageSquare, label: 'Global Chat', path: '/chat', show: isAdmin },
    { icon: Settings, label: 'Settings', path: '/settings', show: true },
  ];

  return (
    <aside className="w-64 glass flex flex-col border-r border-white/10">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
          SENTINEL
        </h1>
        <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">Campus v3.0</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/10' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-white/40 truncate">{user.role} • {user.department || 'General'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
