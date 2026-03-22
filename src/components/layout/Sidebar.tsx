import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart2, GraduationCap, 
  BookOpen, Coffee, Brain, Award, 
  Map as MapIcon, LogOut, Shield,
  QrCode, Database, FileText, Timer,
  Calendar, MessageSquare, Settings,
  Video, BookMarked, Users, Megaphone,
  HardDrive, Download, Newspaper, ScanLine
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  const isStudent = user?.role === 'STUDENT';
  const isHOD = user?.role === 'HOD';
  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    // Core
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', show: true },
    { icon: LayoutDashboard, label: 'Portal', path: '/portal', show: isStudent },
    
    // Learning Tools
    { icon: BookOpen, label: 'Note Synthesis', path: '/notes', show: true },
    { icon: Video, label: 'Soft Skills', path: '/soft-skills', show: true },
    { icon: Coffee, label: 'Study Lounges', path: '/study-lounges', show: isStudent },
    { icon: Brain, label: 'Peer Tutoring', path: '/tutoring', show: isStudent },
    { icon: Award, label: 'Skill Badges', path: '/badges', show: isStudent },
    { icon: MapIcon, label: 'Study Quest', path: '/quest', show: isStudent },
    { icon: GraduationCap, label: 'Grades', path: '/grades', show: isStudent },
    
    // Academic Management
    { icon: QrCode, label: 'Attendance', path: '/attendance', show: !isStudent },
    { icon: ScanLine, label: 'Mark Attendance', path: '/mark-attendance', show: isStudent },
    { icon: FileText, label: 'Projects', path: '/projects', show: true },
    { icon: Calendar, label: 'Schedule', path: '/schedule', show: true },
    { icon: BarChart2, label: 'Leaderboard', path: '/leaderboard', show: true },
    
    // Utilities
    { icon: Timer, label: 'Task Breaker', path: '/task-breaker', show: true },
    { icon: BookMarked, label: 'Book Swap', path: '/book-swap', show: isStudent },
    
    // Admin / HOD
    { icon: Database, label: 'User Mgmt', path: '/users', show: isHOD || isAdmin },
    { icon: BarChart2, label: 'Sentiment', path: '/sentiment', show: isHOD || isAdmin },
    { icon: MessageSquare, label: 'Global Chat', path: '/chat', show: true },
    { icon: Megaphone, label: 'Broadcasts', path: '/broadcasts', show: isAdmin },
    { icon: Newspaper, label: 'Reports', path: '/college-reports', show: isHOD || isAdmin },
    { icon: Users, label: 'Student DB', path: '/student-db', show: isHOD || isAdmin },
    { icon: Users, label: 'Faculty Dir', path: '/faculty-dir', show: true },
    { icon: HardDrive, label: 'DB Explorer', path: '/db-explorer', show: isAdmin },
    { icon: Download, label: 'Bulk Export', path: '/bulk-export', show: isAdmin },
    
    // Settings
    { icon: Settings, label: 'Settings', path: '/settings', show: true },
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 glass border-r border-white/10 flex flex-col h-screen sticky top-0 z-50 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white font-outfit uppercase">
              Sentinel
            </h1>
            <p className="text-[10px] text-primary/50 font-bold tracking-widest uppercase">
              Campus Protocol
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto custom-scrollbar pb-4">
        {menuItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                : 'text-white/40 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4 mb-4 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[1px]">
            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center font-bold text-white font-outfit">
              {user?.name?.charAt(0)}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate text-white">{user?.name}</p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{user?.role} • {user?.department || 'General'}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all duration-300 group border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} className="group-hover:translate-x-[-2px] transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
