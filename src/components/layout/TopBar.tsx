import React from 'react';
import { Search, Bell, Sun, User as UserIcon, Settings, ChevronDown, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user } = useAuthStore();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 md:h-20 glass border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40"
    >
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex flex-1 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search campus records..." 
            className="w-full bg-white/5 border border-white/5 hover:border-white/10 focus:border-primary/40 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/20 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] text-white/20 font-bold pointer-events-none uppercase tracking-widest mt-0.5">
            cmd k
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 pl-4 md:pl-8">
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] border-2 border-background" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <Sun size={20} />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <Settings size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user?.name}</p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-all overflow-hidden text-white/60">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={20} />
            )}
          </div>
          <ChevronDown size={14} className="text-white/20 group-hover:text-white transition-all" />
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
