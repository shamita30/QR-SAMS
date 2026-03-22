import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Shield, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

interface Message {
  id?: string;
  userId: string;
  name: string;
  text: string;
  timestamp: string;
  role: string;
}

const GlobalChat: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.port === '3000' 
      ? `${protocol}//${window.location.hostname}:3001`
      : `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Connected to Chat Server');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_CHAT') {
        const newMessage: Message = {
          userId: data.userId,
          name: data.userName || 'Unknown User',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role: data.userRole || 'STUDENT'
        };
        setMessages(prev => [...prev, newMessage]);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from Chat Server');
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current || !isConnected) return;

    const messageData = {
      type: 'CHAT_MESSAGE',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      text: inputText.trim()
    };

    socketRef.current.send(JSON.stringify(messageData));
    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="text-primary" /> Global Chat
          </h1>
          <p className="text-white/50">Real-time communication across all campus nodes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              {isConnected ? 'Network Online' : 'Connecting...'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Users size={14} />
            <span>Active Nodes: {isConnected ? 'Stable' : 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                <MessageSquare size={60} />
                <p className="font-mono text-sm">Waiting for incoming transmissions...</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${msg.userId === user.id ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'ADMIN' && <Shield size={12} className="text-secondary" />}
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{msg.name}</span>
                    <span className="text-[10px] text-white/20 font-mono italic">{msg.timestamp}</span>
                  </div>
                  <div className={`
                    max-w-[70%] p-4 rounded-2xl text-sm 
                    ${msg.userId === user.id 
                      ? 'bg-primary/20 text-white border border-primary/20 rounded-tr-none shadow-lg shadow-primary/5' 
                      : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'}
                  `}>
                    {msg.text}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="relative flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Transmit message to all active nodes..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
              disabled={!isConnected}
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || !isConnected}
              className={`
                px-6 rounded-xl flex items-center justify-center transition-all
                ${inputText.trim() && isConnected 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95' 
                  : 'bg-white/5 text-white/20'}
              `}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalChat;
