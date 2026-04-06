import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Shield, Users, Hash, Check, CheckCheck, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import GlassCard from '../components/ui/GlassCard';

const rooms = [
  { id: 'global', name: 'Global Nexus', icon: Hash, category: 'CAMPUS' },
  { id: 'cse-general', name: 'Faculty Forum', icon: Shield, category: 'FACULTY' },
  { id: 'it-general', name: 'IT Peer Group', icon: Users, category: 'STUDENT' },
];

const GlobalChat: React.FC = () => {
  const { user } = useAuthStore();
  const { isConnected, onlineUsers, messages, initSocket, joinRoom, sendMessage, markAsRead } = useSocketStore();
  const [activeRoom, setActiveRoom] = useState('global');
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      initSocket(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    joinRoom(activeRoom);
    // Fetch history
    fetch(`/api/chat/${activeRoom}`)
      .then(r => r.json())
      .then(history => {
        useSocketStore.setState(state => ({
          messages: { ...state.messages, [activeRoom]: history }
        }));
      });
  }, [activeRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    // Mark unread as read
    const currentMessages = messages[activeRoom] || [];
    currentMessages.forEach(msg => {
      if (msg.userId !== user?.id && msg.status === 'SENT') {
        markAsRead(msg.id, activeRoom);
      }
    });
  }, [messages[activeRoom]]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected || !user) return;
    sendMessage(activeRoom, user.id, user.name, user.role, inputText.trim());
    setInputText('');
  };

  const rawMessages = messages[activeRoom] || [];
  const currentMessages = Array.isArray(rawMessages) ? rawMessages : [];

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Sidebar: Rooms */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="text-primary" />
          <h1 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Nexus Chat</h1>
        </div>
        
        <div className="space-y-2">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                activeRoom === room.id 
                ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(59,130,246,0.1)] text-white' 
                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeRoom === room.id ? 'bg-primary/20 text-primary' : 'bg-white/5'}`}>
                <room.icon size={18} />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">{room.name}</p>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{room.category}</p>
              </div>
            </button>
          ))}
        </div>

        <GlassCard className="mt-auto p-4 border-accent/20 bg-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold text-white/60 uppercase">{isConnected ? 'System Online' : 'Offline'}</span>
            </div>
            <span className="text-[10px] font-mono text-white/20">Protocol v4.0</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
               {(() => {
                 const ActiveIcon = rooms.find(r => r.id === activeRoom)?.icon;
                 return ActiveIcon ? <ActiveIcon size={20} /> : null;
               })()}
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wider">{rooms.find(r => r.id === activeRoom)?.name}</h3>
              <p className="text-[11px] text-white/50">{onlineUsers.size} peer nodes connected</p>
            </div>
          </div>
          <button className="p-2 text-white/50 hover:text-white transition-colors">
             <MoreVertical size={20} />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative"
        >
          {/* WhatsApp style doodle background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <AnimatePresence initial={false}>
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                <MessageSquare size={80} />
                <p className="font-outfit uppercase tracking-[0.3em] text-xs">Awaiting synchronization...</p>
              </div>
            ) : (
              currentMessages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{msg.name} • {msg.role}</span>
                  </div>
                  <div className="flex items-end gap-2 max-w-[75%]">
                    {msg.userId !== user?.id && (
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary mb-1">
                        {msg.name.charAt(0)}
                      </div>
                    )}
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-xl ${
                      msg.userId === user?.id 
                        ? 'bg-primary/20 text-white border border-primary/20 rounded-tr-none' 
                        : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                      <div className="mt-1 flex items-center justify-end gap-1.5 opacity-40">
                        <span className="text-[8px] font-mono">{msg.timestamp}</span>
                        {msg.userId === user?.id && (
                          msg.status === 'READ' ? <CheckCheck size={12} className="text-accent" /> : <Check size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <button type="button" className="p-3 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5">
               <Smile size={24} />
            </button>
            <button type="button" className="p-3 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5">
               <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm outline-none focus:bg-white/10 transition-all font-medium mx-2"
              disabled={!isConnected}
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || !isConnected}
              className={`
                p-4 rounded-full flex items-center justify-center transition-all bg-primary shadow-lg hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50
              `}
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalChat;
