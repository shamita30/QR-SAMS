import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { User } from '../types';

interface GlobalChatWidgetProps {
  user: User;
}

const GlobalChatWidget: React.FC<GlobalChatWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', user: 'Admin', text: 'Welcome to the Sentinel Global Broadcast network.', type: 'SYSTEM' },
    { id: '2', user: 'HOD CSE', text: 'Phase 4 proposals are now being reviewed.', type: 'USER' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), user: user.name, text: input, type: 'USER' }]);
    setInput('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 h-96 glass-card flex flex-col overflow-hidden shadow-2xl border-white/20"
          >
            <div className="p-4 bg-primary/20 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                <span className="font-bold text-sm">Global Chat</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.user === user.name ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-widest">{msg.user}</span>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                    msg.type === 'SYSTEM' ? 'bg-white/5 border border-white/10 text-white/60 text-center w-full italic' : 
                    msg.user === user.name ? 'bg-primary text-white' : 'bg-white/10 text-white'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'ENTER' && sendMessage()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50" 
                placeholder="Type message..." 
              />
              <button onClick={sendMessage} className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:bg-primary-hover transition-colors">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center transition-all hover:scale-110 active:scale-90 relative"
      >
        {isOpen ? <X /> : <MessageSquare />}
        {!isOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-[#050505] animate-pulse" />}
      </button>
    </div>
  );
};

export default GlobalChatWidget;
