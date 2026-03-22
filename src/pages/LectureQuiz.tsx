import React, { useState } from 'react';
import { 
  FileQuestion, Clock, CheckCircle2, XCircle, 
  ArrowRight, Award, Brain, Zap,
  Settings, Play, RotateCcw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LectureQuiz: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = [
    {
      q: "Which protocol is primarily used for stateless communication between services in modern cloud architectures?",
      options: ["HTTP/REST", "TCP/Direct", "FTP/Legacy", "SMTP/Relay"],
      answer: "HTTP/REST",
      explanation: "HTTP/REST is the standard for stateless communication, allowing services to scale independently and maintain modular interdependency."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!isStarted ? (
        <div className="glass-card p-12 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
           <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
           <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-2xl animate-pulse">
             <FileQuestion size={48} />
           </div>
           <div>
             <h1 className="text-4xl font-bold tracking-tighter italic underline decoration-primary decoration-4">Lecture Integrity Quiz</h1>
             <p className="text-white/40 mt-3 text-lg">Verify your comprehension of the latest Cloud Computing session.</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Time Limit</p>
                <p className="text-sm font-bold">10:00 Mins</p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Reward</p>
                <p className="text-sm font-bold text-primary">+150 XP</p>
             </div>
           </div>

           <button 
             onClick={() => setIsStarted(true)}
             className="w-full max-w-sm btn-primary py-5 rounded-2xl text-lg justify-center font-bold shadow-2xl shadow-primary/40 hover:scale-[1.02]"
           >
             Start Protocol <Play className="ml-2" fill="currentColor" size={20} />
           </button>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-primary font-bold">1</div>
                 <div>
                   <h3 className="font-bold text-sm">Question 1 of 5</h3>
                   <div className="w-32 h-1 bg-white/5 rounded-full mt-2">
                     <div className="h-full bg-primary w-1/5 rounded-full" />
                   </div>
                 </div>
              </div>
              <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl border border-red-500/20 font-mono font-bold">
                 <Clock size={16} /> 09:45
              </div>
           </div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-10 space-y-8">
              <h2 className="text-2xl font-bold leading-tight">{questions[currentQuestion].q}</h2>
              
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestion].options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => setShowExplanation(true)}
                    className="w-full text-left p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all font-medium flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-primary/50" />
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-6 bg-accent/10 rounded-2xl border border-accent/20 space-y-3">
                    <div className="flex items-center gap-2 text-accent font-bold uppercase text-[10px] tracking-widest">
                       <CheckCircle2 size={16} /> Technical Explanation
                    </div>
                    <p className="text-sm leading-relaxed text-white/80">{questions[currentQuestion].explanation}</p>
                    <button className="mt-4 btn-primary bg-accent hover:bg-accent/80 text-white w-full justify-center">Next Question <ArrowRight size={18} /></button>
                  </motion.div>
                )}
              </AnimatePresence>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default LectureQuiz;
