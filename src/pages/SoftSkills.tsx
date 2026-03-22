import React, { useState } from 'react';
import { 
  Video, Play, Award, 
  ChevronRight, ArrowLeft, Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SoftSkills: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  const modules = [
    {
      id: 1,
      title: "Digital Leadership",
      desc: "Mastering team coordination in virtual environments.",
      color: "#8b5cf6",
      lessons: [
        { id: 'l1', title: 'Remote Team Dynamics', duration: '12 min' },
        { id: 'l2', title: 'Digital Empathy', duration: '15 min' },
        { id: 'l3', title: 'Strategic Visioning', duration: '20 min' }
      ]
    },
    {
      id: 2,
      title: "Emotional Intelligence",
      desc: "Understanding behavioral cues and empathy.",
      color: "#ec4899",
      lessons: [
        { id: 'l4', title: 'Self-Awareness', duration: '10 min' },
        { id: 'l5', title: 'Conflict Resolution', duration: '18 min' }
      ]
    },
    {
      id: 3,
      title: "Critical Thinking",
      desc: "Advanced problem solving and logic.",
      color: "#10b981",
      lessons: [
        { id: 'l6', title: 'Bias Identification', duration: '14 min' },
        { id: 'l7', title: 'Logical Fallacies', duration: '16 min' }
      ]
    }
  ];

  const handleReaction = (emoji: string) => {
    setReaction(emoji);
    setTimeout(() => setReaction(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
            Soft Skills Academy
          </h1>
          <p className="text-white/40 mt-2">Elevate your professional interpersonal capabilities.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedModule ? (
          <motion.div 
            key="module-grid"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {modules.map((m) => (
              <div 
                key={m.id} 
                onClick={() => {
                  console.log('Module selected:', m.title);
                  setSelectedModule(m);
                }}
                className="glass-card p-6 cursor-pointer group"
              >
                <div 
                  className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${m.color}20` }}
                >
                  <Video style={{ color: m.color }} size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{m.title}</h3>
                <p className="text-sm text-white/40 mb-6">{m.desc}</p>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-primary gap-2">
                  View Lessons <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="lesson-view"
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <button 
              onClick={() => { 
                console.log('Going back to academy');
                setSelectedModule(null); 
                setIsPlaying(false); 
              }}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} /> Back to Academy
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-video glass rounded-3xl overflow-hidden relative group">
                  {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center" style={{ zIndex: 10 }}>
                      <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative animate-pulse">
                        <Star className="text-primary absolute -top-2 -right-2" />
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                        >
                          <Award size={64} className="text-primary" />
                        </motion.div>
                      </div>
                      <h2 className="text-2xl font-bold mb-4">{selectedModule.title}: Introduction</h2>
                      <button 
                        onClick={() => {
                          console.log('Starting lesson');
                          setIsPlaying(true);
                        }}
                        className="btn-primary px-8 py-4 rounded-2xl text-lg relative z-20"
                      >
                        <Play fill="currentColor" /> Start Lesson
                      </button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-[#111] flex flex-col items-center justify-center p-12">
                      <div className="w-full flex justify-between items-center mb-12 relative z-20">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-primary rounded-full animate-bounce" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-white/10 rounded-full" />
                            <div className="h-2 w-20 bg-white/5 rounded-full" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {['😄', '❤️', '🔥', '🤔'].map(emoji => (
                            <button 
                              key={emoji}
                              onClick={() => {
                                console.log('Reaction:', emoji);
                                handleReaction(emoji);
                              }}
                              className="w-10 h-10 glass rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-xl"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <svg width="200" height="200" viewBox="0 0 200 200" className="animate-pulse">
                          <circle cx="100" cy="100" r="80" fill="#2d2d2d" stroke="#8b5cf6" strokeWidth="4" />
                          <circle cx="70" cy="80" r="8" fill="white" />
                          <circle cx="130" cy="80" r="8" fill="white" />
                          {reaction === '😄' ? (
                             <path d="M 60 120 Q 100 170 140 120" stroke="#8b5cf6" strokeWidth="6" fill="none" strokeLinecap="round" />
                          ) : (
                             <path d="M 70 130 Q 100 130 130 130" stroke="#8b5cf6" strokeWidth="4" fill="none" strokeLinecap="round" />
                          )}
                        </svg>
                        {reaction && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{ opacity: 1, scale: 1.5, y: -100 }}
                            className="absolute top-0 right-0 text-4xl"
                          >
                            {reaction}
                          </motion.div>
                        )}
                        {reaction === '😄' && (
                          <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                            Leadership Level Up!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-white/40 mb-4">Module Curriculum</h4>
                {selectedModule.lessons.map((lesson: any, i: number) => (
                  <div key={lesson.id} className="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-white/20 w-4">{i + 1}</span>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{lesson.title}</p>
                        <p className="text-[10px] text-white/30">{lesson.duration}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoftSkills;
