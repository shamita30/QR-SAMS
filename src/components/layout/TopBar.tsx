import React from 'react';
import { Search, Bell, Coins, User as UserIcon, ChevronDown, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useGamificationStore } from '../../store/useGamificationStore';
import XPBar from '../gamification/XPBar';

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user } = useAuthStore();
  const { coins, level } = useGamificationStore();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 md:h-18 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 border-b border-white/[0.04]"
      style={{ background: 'rgba(6,10,20,0.8)', backdropFilter: 'blur(20px) saturate(180%)' }}
    >
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-xl text-white/60 hover:text-[#ff8243] hover:bg-[#ff8243]/5 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex flex-1 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ff8243] transition-colors" />
          <input 
            type="text" 
            placeholder="Search the metaverse..." 
            className="w-full bg-white/[0.03] border border-white/[0.06] hover:border-white/10 focus:border-[#ff8243]/30 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/15 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white/5 rounded-md border border-white/10 text-[9px] text-white/15 font-bold pointer-events-none uppercase tracking-widest">
            ⌘K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-8">
        {/* Quick stats for mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fce883]/10 border border-[#fce883]/15">
            <Coins size={11} className="text-[#fce883]" />
            <span className="text-[9px] font-bold text-[#fce883]">{coins}</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-[#ff8243] transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff8243] rounded-full shadow-[0_0_8px_rgba(255,130,67,0.6)] border border-[#060a14]" />
        </button>

        <div className="h-6 w-px bg-white/[0.06] hidden md:block" />
        
        {/* XP Bar - Desktop */}
        <div className="hidden lg:block">
          <XPBar />
        </div>

        <div className="h-6 w-px bg-white/[0.06] hidden md:block" />

        {/* User profile */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-white group-hover:text-[#ff8243] transition-colors">{user?.name}</p>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff8243]/20 to-[#fce883]/10 border border-[#ff8243]/20 flex items-center justify-center group-hover:border-[#ff8243]/40 transition-all overflow-hidden text-white/60">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#ff8243] flex items-center justify-center text-[6px] font-black text-white border-[1.5px] border-[#060a14]">
              {level}
            </div>
          </div>
          <ChevronDown size={12} className="text-white/15 group-hover:text-white/40 transition-all hidden md:block" />
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
