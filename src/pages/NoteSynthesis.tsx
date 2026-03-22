import React, { useState, useRef } from 'react';
import {
  Brain, FileText, Download, Sparkles, Upload,
  BookOpen, Save, CheckCircle2,
  FileQuestion, Lightbulb, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteSynthesisResult } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const NoteSynthesis: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [adminMode, setAdminMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [inputText, setInputText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState<NoteSynthesisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'FLASHCARDS' | 'QUIZ'>('SUMMARY');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSynthesize = () => {
    console.log('Synthesize triggered with input length:', inputText.length);
    if (!inputText.trim()) return;
    setIsSynthesizing(true);

    // Simulate dynamic parsing
    setTimeout(() => {
      const words = inputText.trim().split(/\s+/).filter(w => w.length > 3);
      const uniqueWords = Array.from(new Set(words));
      const mainSubject = uniqueWords.length > 0 ? uniqueWords[0] : 'the material';
      const topics = uniqueWords.slice(1, 5);

      const mockResult: NoteSynthesisResult = {
        summary: `This analysis focuses on ${mainSubject}, exploring its implications and structural relationship with ${topics.join(', ')}. The text highlights key methodologies for implementing efficient systems while maintaining scalability and modularity.`,
        keyPoints: [
          `Core principles of ${mainSubject} as discussed in the text.`,
          `Practical application of ${topics[0] || 'the subject matter'}.`,
          `Integrating ${topics[1] || 'modern frameworks'} with legacy protocols.`,
          `Recommendations for future-proofing ${topics[2] || 'the architecture'}.`
        ],
        flashcards: uniqueWords.slice(0, 3).map((w) => ({
          question: `How does the text define the role of ${w}?`,
          answer: `The document describes ${w} as a critical component in the overall ecosystem of ${mainSubject}.`
        })),
        quiz: [
          {
            question: `What is the primary relationship between ${mainSubject} and ${topics[0] || 'the core topic'}?`,
            options: ["Direct dependency", "No correlation", "Inverse relationship", "Theoretical only"],
            answer: "Direct dependency",
            explanation: `The text explicitly mentions that ${mainSubject} relies on ${topics[0] || 'the subject'} for operational efficiency.`
          },
          {
            question: `Which of the following is NOT mentioned as a key factor for ${mainSubject}?`,
            options: ["Scalability", "Manual validation", "Modularity", "Automated flows"],
            answer: "Manual validation",
            explanation: "The text emphasizes automated validation flows over manual ones."
          }
        ]
      };

      console.log('Synthesis complete:', mockResult);
      setResult(mockResult);
      setIsSynthesizing(false);
    }, 1500);
  };

  const handleSaveToLibrary = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    setSaveStatus('IDLE');

    try {
      const endpoint = (isAdmin && adminMode) ? 'http://localhost:3001/api/synthesis/admin/upload' : 'http://localhost:3001/api/notes';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: inputText.substring(0, 30) || 'Untitled Synthesis',
          content: inputText,
          summary: result.summary,
          keyPoints: result.keyPoints,
          flashcards: result.flashcards,
          quiz: result.quiz
        }),
      });

      if (response.ok) {
        setSaveStatus('SUCCESS');
        setTimeout(() => setSaveStatus('IDLE'), 3000);
      } else {
        setSaveStatus('ERROR');
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic flex items-center gap-3">
            Note Synthesis
            {isAdmin && adminMode && (
              <span className="text-sm font-bold bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
                Global Admin Mode
              </span>
            )}
          </h1>
          <p className="text-white/40 mt-2">AI-driven extraction of key knowledge from your materials.</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              className={`btn-secondary flex items-center gap-2 ${adminMode ? 'bg-red-500/20 text-red-400 border-red-500/50' : ''}`}
              onClick={() => setAdminMode(!adminMode)}
            >
              <Globe size={18} /> Global Publish
            </button>
          )}
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> {adminMode ? 'Upload Master Document' : 'Upload File'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.md,.rtf"
          />
          <button
            className="btn-primary"
            onClick={handleSynthesize}
            disabled={isSynthesizing || !inputText.trim()}
          >
            {isSynthesizing ? (
              <><Sparkles className="animate-spin" size={18} /> Processing...</>
            ) : (
              <><Brain size={18} /> Generate Knowledge Base</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)]">
        {/* Input Side */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <FileText size={18} />
              <span className="font-bold text-sm uppercase tracking-widest">Raw Content</span>
            </div>
            <span className="text-[10px] text-white/20">{inputText.length} characters</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-white/80 outline-none focus:border-primary/50 transition-all resize-none font-mono text-sm leading-relaxed"
            placeholder="Paste your notes here or upload a file to begin synthesis..."
          />
        </div>

        {/* Output Side */}
        <div className="glass-card flex flex-col overflow-hidden">
          {!result && !isSynthesizing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="text-primary animate-pulse" size={40} />
              </div>
              <div className="max-w-xs">
                <h3 className="text-xl font-bold mb-2">Ready to Synthesize</h3>
                <p className="text-white/40 text-sm">Input your materials to generate summaries, flashcards, and interactive quizzes.</p>
              </div>
            </div>
          ) : isSynthesizing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="relative">
                <Brain className="text-primary animate-bounce" size={60} />
                <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-primary font-bold animate-pulse text-sm uppercase tracking-[0.2em]">Analyzing Architecture...</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex border-b border-white/10 p-2">
                {[
                  { id: 'SUMMARY', label: 'Summary', icon: BookOpen },
                  { id: 'FLASHCARDS', label: 'Flashcards', icon: Lightbulb },
                  { id: 'QUIZ', label: 'Quiz', icon: FileQuestion }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary/20 text-primary font-bold' : 'text-white/40 hover:text-white'
                      }`}
                  >
                    <tab.icon size={16} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <AnimatePresence mode="wait">
                  {activeTab === 'SUMMARY' && result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <p className="text-lg leading-relaxed mb-6 text-white/80">{result.summary}</p>
                      <h4 className="font-bold text-sm uppercase text-primary tracking-widest mb-4">Core Principles</h4>
                      <div className="space-y-3">
                        {result.keyPoints.map((point, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                            <CheckCircle2 className="text-accent shrink-0 mt-1" size={16} />
                            <span className="text-sm">{point}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'FLASHCARDS' && result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      {result.flashcards.map((card, idx) => (
                        <div key={idx} className="group relative glass p-5 rounded-xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer">
                          <p className="text-primary text-xs font-bold mb-1">PROMPT</p>
                          <p className="font-medium mb-3">{card.question}</p>
                          <div className="p-3 bg-white/5 rounded-lg text-sm text-white/60 group-hover:text-white transition-colors">
                            {card.answer}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'QUIZ' && result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      {result.quiz.map((q, qidx) => (
                        <div key={qidx} className="glass p-6 rounded-xl border border-white/10 space-y-4">
                          <p className="font-bold">Q{qidx + 1}: {q.question}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oidx) => (
                              <button key={oidx} className="w-full text-left p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-sm">
                                {opt}
                              </button>
                            ))}
                          </div>
                          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-xs">
                            <span className="font-bold text-accent">EXPLANATION:</span> {q.explanation}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 border-t border-white/10 flex gap-4">
                <button
                  onClick={handleSaveToLibrary}
                  disabled={isSaving || saveStatus === 'SUCCESS'}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${saveStatus === 'SUCCESS' ? 'bg-green-500/20 text-green-500' : 'bg-white/5 hover:bg-white/10'
                    }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : saveStatus === 'SUCCESS' ? (
                    <><CheckCircle2 size={14} /> Saved!</>
                  ) : (
                    <><Save size={14} /> Save to Library</>
                  )}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                  <Download size={14} /> Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteSynthesis;
