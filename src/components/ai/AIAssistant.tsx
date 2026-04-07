import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am Sentinel AI. How can I assist your protocol today?' }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response || 'Error processing request.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'System offline. Protocol violation detected.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Expanding Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-80 sm:w-96 h-[500px] z-[100] flex flex-col rounded-[2rem] overflow-hidden glass border border-white/20 shadow-[0_10px_50px_rgba(59,130,246,0.3)]"
          >
            {/* Header */}
            <div className="p-4 bg-primary/20 backdrop-blur-md border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white">Sentinel AI</h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Neural Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
               >
                <X size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 max-w-[85%] rounded-2xl text-sm leading-relaxed shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary/30 text-white border border-primary/20 rounded-br-none' 
                        : 'bg-white/10 text-white border border-white/10 rounded-bl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-bl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Sentinel AI..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-white/30"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-3 bg-primary rounded-xl text-white shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-[0_8px_32px_rgba(59,130,246,0.4)] z-[100] group overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white/10 glass border border-white/20 text-white' : 'bg-gradient-to-br from-primary to-secondary'}`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-background animate-bounce z-20">
             <Sparkles size={10} className="text-white" />
          </div>
        )}
        {isOpen ? <X size={24} className="relative z-10" /> : <Bot size={28} className="relative z-10" />}
        
        {!isOpen && <div className="absolute inset-0 rounded-3xl bg-primary/40 animate-ping opacity-20" />}
      </motion.button>
    </>
  );
};

export default AIAssistant;
