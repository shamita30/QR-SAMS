import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart2, GraduationCap, 
  BookOpen, Coffee, Brain, Award, 
  Map as MapIcon, LogOut, Shield,
  QrCode, Database, FileText, Timer,
  Calendar, MessageSquare, Settings,
  Video, BookMarked, Users, Megaphone,
  HardDrive, Download, Newspaper, ScanLine,
  Target, Flame, Coins, Zap, Trophy,
  Gamepad2, Sparkles, Globe, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useGamificationStore } from '../../store/useGamificationStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  districtName: string;
  items: {
    icon: React.ElementType;
    label: string;
    path: string;
    show: boolean;
    badge?: string;
    xpReward?: number;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const { xp, level, coins, streak, getRank } = useGamificationStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['headquarters', 'learning_zones']);
  
  const isStudent = user?.role === 'STUDENT';
  const isHOD = user?.role === 'HOD';
  const isAdmin = user?.role === 'ADMIN';
  const isFaculty = user?.role === 'FACULTY';

  const rank = getRank();

  const xpForCurrentLevel = Math.pow(level - 1, 2) * 250;
  const xpForNextLevel = Math.pow(level, 2) * 250;
  const currentLevelXP = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpPercent = Math.min(100, Math.max(0, (currentLevelXP / xpNeeded) * 100));

  const sections: NavSection[] = [
    {
      id: 'headquarters',
      label: 'Headquarters',
      icon: LayoutDashboard,
      districtName: isStudent ? 'Player HQ' : isFaculty ? 'Mission Control' : isHOD ? 'District Command' : 'System Core',
      items: [
        { icon: LayoutDashboard, label: 'Command Center', path: '/dashboard', show: true },
        { icon: Gamepad2, label: 'Interactive Runner', path: '/runner', show: true, badge: 'GAME' },
        { icon: Gamepad2, label: 'Player Portal', path: '/portal', show: isStudent, badge: 'NEW' },
      ],
    },
    {
      id: 'learning_zones',
      label: 'Learning Zones',
      icon: BookOpen,
      districtName: '🌍 Learning Worlds',
      items: [
        { icon: BookOpen, label: 'Note Synthesis', path: '/notes', show: isStudent || isFaculty, xpReward: 20 },
        { icon: Video, label: 'Skill Arena', path: '/soft-skills', show: isStudent, xpReward: 30 },
        { icon: Coffee, label: 'Study Lounges', path: '/study-lounges', show: isStudent, xpReward: 15 },
        { icon: Brain, label: 'Peer Guild', path: '/tutoring', show: isStudent, xpReward: 25 },
        { icon: Award, label: 'Badge Vault', path: '/badges', show: isStudent },
        { icon: MapIcon, label: 'Quest Map', path: '/quest', show: isStudent, xpReward: 50 },
        { icon: GraduationCap, label: 'Grade Matrix', path: '/grades', show: isStudent },
      ],
    },
    {
      id: 'missions',
      label: 'Missions',
      icon: Target,
      districtName: '⚡ Mission Board',
      items: [
        { icon: ScanLine, label: 'Streak Checkpoint', path: '/mark-attendance', show: isStudent, xpReward: 30 },
        { icon: QrCode, label: 'Attendance Scan', path: '/attendance', show: isFaculty || isHOD },
        { icon: BookOpen, label: 'Class Sessions', path: '/classes', show: isFaculty || isHOD || isStudent },
        { icon: FileText, label: 'Project Missions', path: '/projects', show: isStudent || isFaculty || isHOD, xpReward: 100 },
        { icon: Target, label: 'Assignments', path: '/assignments', show: true, xpReward: 75 },
        { icon: Calendar, label: 'Timeline', path: '/schedule', show: isStudent || isFaculty || isHOD },
        { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', show: true },
      ],
    },
    {
      id: 'utilities',
      label: 'Utilities',
      icon: Sparkles,
      districtName: '🔧 Power-Ups',
      items: [
        { icon: Timer, label: 'Task Breaker', path: '/task-breaker', show: isStudent },
        { icon: BookMarked, label: 'Book Swap', path: '/book-swap', show: isStudent },
      ],
    },
    {
      id: 'social',
      label: 'Social',
      icon: Globe,
      districtName: '💬 Nexus Hub',
      items: [
        { icon: MessageSquare, label: 'Global Chat', path: '/chat', show: true },
        { icon: Megaphone, label: 'Broadcasts', path: '/broadcasts', show: isAdmin || isFaculty },
        { icon: Users, label: 'Student DB', path: '/student-db', show: isHOD || isAdmin || isFaculty },
        { icon: Users, label: 'Faculty Dir', path: '/faculty-dir', show: isStudent || isHOD || isAdmin },
      ],
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Database,
      districtName: '🛡️ System Core',
      items: [
        { icon: Database, label: 'User Management', path: '/users', show: isHOD || isAdmin },
        { icon: BarChart2, label: 'Sentiment Core', path: '/sentiment', show: isHOD || isAdmin },
        { icon: Newspaper, label: 'Reports', path: '/college-reports', show: isHOD || isAdmin },
        { icon: HardDrive, label: 'DB Explorer', path: '/db-explorer', show: isAdmin },
        { icon: Download, label: 'Bulk Export', path: '/bulk-export', show: isAdmin },
        { icon: Settings, label: 'Settings', path: '/settings', show: isAdmin },
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      <aside 
        className={`fixed lg:sticky top-0 left-0 w-[280px] flex flex-col h-screen z-50 overflow-hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          background: 'linear-gradient(180deg, rgba(12,16,32,0.98) 0%, rgba(6,10,20,0.99) 100%)',
          borderRight: '1px solid rgba(255,130,67,0.08)',
        }}
      >
        {/* ═══ Logo Section ═══ */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3 group cursor-pointer">
            <motion.div 
              className="p-2 rounded-xl bg-gradient-to-br from-[#ff8243]/20 to-[#fce883]/10 border border-[#ff8243]/30 relative"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-xl bg-[#ff8243]/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="w-6 h-6 text-[#ff8243] relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white font-outfit uppercase">
                Sentinel
              </h1>
              <p className="text-[8px] text-[#ff8243]/50 font-mono font-bold tracking-[0.25em] uppercase">
                Metaverse v5.0
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Player Stats Bar ═══ */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-[#ff8243]/[0.06] to-[#fce883]/[0.04] border border-[#ff8243]/10">
          {/* Level & Rank */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{rank.icon}</span>
              <div>
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block leading-none">Level {level}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: rank.color }}>{rank.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fce883]/10 border border-[#fce883]/20">
                <Coins size={10} className="text-[#fce883]" />
                <span className="text-[9px] font-bold text-[#fce883]">{coins}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="relative">
            <div className="flex justify-between text-[8px] text-white/30 font-mono mb-1">
              <span className="flex items-center gap-1">
                <Zap size={8} className="text-[#ff8243]" />
                {xp.toLocaleString()} XP
              </span>
              <span>{Math.floor(xpNeeded - currentLevelXP)} to next</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full xp-bar"
              />
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Flame size={10} className="text-[#ff6b35]" />
              <span className="text-[9px] font-bold text-[#ff6b35]">{streak} Day Streak</span>
            </div>
            <div className="flex gap-0.5">
              {[...Array(Math.min(7, streak))].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#ff6b35] shadow-[0_0_4px_rgba(255,107,53,0.5)]" />
              ))}
              {streak < 7 && [...Array(7 - Math.min(7, streak))].map((_, i) => (
                <div key={`e-${i}`} className="w-2 h-2 rounded-full bg-white/10" />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Navigation ═══ */}
        <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar pb-3 space-y-1">
          {sections.map(section => {
            const visibleItems = section.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;
            const isExpanded = expandedSections.includes(section.id);

            return (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] hover:text-white/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {section.districtName}
                  </span>
                  {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </button>

                {/* Section Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden text-sm
                            ${isActive 
                              ? 'bg-gradient-to-r from-[#ff8243]/15 to-transparent text-[#ff8243] border border-[#ff8243]/20 shadow-[0_0_15px_rgba(255,130,67,0.1)]' 
                              : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03] border border-transparent'}
                          `}
                        >
                          <item.icon size={16} className="group-hover:scale-110 transition-transform shrink-0" />
                          <span className="font-bold text-[12px] tracking-wide truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[7px] font-black px-1.5 py-0.5 rounded-md bg-[#ff8243]/20 text-[#ff8243] uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                          {item.xpReward && (
                            <span className="ml-auto text-[8px] font-bold text-[#fce883]/50 flex items-center gap-0.5">
                              +{item.xpReward}<Zap size={7} />
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* ═══ User Section ═══ */}
        <div className="p-3 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8243] to-[#fce883] p-[1.5px]">
                <div className="w-full h-full rounded-xl bg-[#060a14] flex items-center justify-center font-black text-white font-outfit text-sm">
                  {user?.name?.charAt(0)}
                </div>
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ff8243] flex items-center justify-center text-[7px] font-black text-white border-2 border-[#060a14]">
                {level}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-white">{user?.name}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: rank.color }}>
                {rank.name} • {user?.role}
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-2.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-300 group border border-transparent hover:border-red-500/15 text-xs"
          >
            <LogOut size={14} className="group-hover:translate-x-[-2px] transition-transform" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Disconnect</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
