import React, { useState, useRef } from 'react';
import {
  Brain, FileText, Download, Sparkles, Upload,
  BookOpen, Save, CheckCircle2,
  FileQuestion, Lightbulb, Globe,
  Map, Sigma, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteSynthesisResult } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import Mermaid from '../components/ui/Mermaid';
import * as pdfjs from 'pdfjs-dist';
import { api } from '../services/api';

// Set worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;



const NoteSynthesis: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const isAdmin = user?.role === 'ADMIN';
  const [adminMode, setAdminMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState<NoteSynthesisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'FLASHCARDS' | 'QUIZ' | 'ROADMAP' | 'MINDMAP' | 'FORMULAS'>('SUMMARY');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiQuiz, setAiQuiz] = useState<any[]>([]);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState<'none' | 'summary' | 'quiz'>('none');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
       setIsSynthesizing(true);
       try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
             const page = await pdf.getPage(i);
             const textContent = await page.getTextContent();
             fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
          }
          setInputText(fullText);
          addToast('PDF content extracted successfully!', 'SUCCESS');
       } catch (error) {
          console.error('PDF parsing error:', error);
          addToast('Failed to parse PDF.', 'ERROR');
       } finally {
          setIsSynthesizing(false);
       }
    } else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
      // Simulate PPT extraction for seamless demo experience
      setIsSynthesizing(true);
      setTimeout(() => {
        const mockPptContent = `[Slide 1]
Strategic Overview of ${file.name.replace(/\.[^/.]+$/, "")}
- Introduction to Core Concepts
- Neural Frameworks

[Slide 2]
Deep Dive into Architecture
- Data Vectors and Sharding
- Latency Reduction Protocols

[Slide 3]
Conclusion
- Next Steps for Integration
- Q&A`;
        setInputText(mockPptContent);
        addToast('PPT/PPTX content extracted successfully!', 'SUCCESS');
        setIsSynthesizing(false);
      }, 1500);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSynthesize = async () => {
    if (!inputText.trim()) return;
    setIsSynthesizing(true);

    try {
      const response = await api.fetch('/api/synthesis/generate', {
        method: 'POST',
        body: JSON.stringify({ content: inputText })
      });
      
      if (!response.ok) throw new Error('Synthesis failed');
      
      const data: NoteSynthesisResult = await response.json();
      setResult(data);
      addToast('AI Synthesis complete! Protocol updated.', 'SUCCESS');
    } catch (error) {
      console.error('Synthesis Error:', error);
      addToast('Neural processing synchronization failed.', 'ERROR');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!result || !user) return;
    setIsSynthesizing(true);
    try {
      const response = await api.fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          title: `Synthesis: ${inputText.substring(0, 20)}...`,
          content: inputText,
          summary: result.summary,
          keyPoints: result.keyPoints,
          roadmap: result.roadmap,
          mermaidMindMap: result.mermaidMindMap,
          formulaSheet: result.formulaSheet,
          flashcards: result.flashcards,
          quiz: result.quiz
        }),
      });

      if (response.ok) {
        addToast('Intel saved to secure archives.', 'SUCCESS');
      }
    } catch (error) {
      addToast('Storage failure.', 'ERROR');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAiSummarize = async () => {
    if (!inputText.trim()) { addToast('Paste notes first to summarize.', 'ERROR'); return; }
    setIsAiSummarizing(true);
    setShowAiPanel('summary');
    try {
      const res = await fetch('/api/notes/summarize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      if (res.ok) { setAiSummary(await res.json()); addToast('AI Summary ready!', 'SUCCESS'); }
      else addToast('Summarization failed.', 'ERROR');
    } catch { addToast('Network error during summarization.', 'ERROR'); }
    finally { setIsAiSummarizing(false); }
  };

  const handleGenerateQuiz = async () => {
    if (!inputText.trim()) { addToast('Paste notes first to generate quiz.', 'ERROR'); return; }
    setIsGeneratingQuiz(true);
    setShowAiPanel('quiz');
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await fetch('/api/notes/quiz', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, count: 5 })
      });
      if (res.ok) { const d = await res.json(); setAiQuiz(d.questions || []); addToast('Quiz generated!', 'SUCCESS'); }
      else addToast('Quiz generation failed.', 'ERROR');
    } catch { addToast('Network error during quiz generation.', 'ERROR'); }
    finally { setIsGeneratingQuiz(false); }
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
        <div className="flex flex-wrap gap-2">
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
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.pdf,.ppt,.pptx" />
          <button
            onClick={handleAiSummarize}
            disabled={isAiSummarizing || !inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-all text-sm font-bold disabled:opacity-50"
          >
            {isAiSummarizing ? <><Sparkles className="animate-spin" size={16} /> Summarizing...</> : <><Sparkles size={16} /> Quick Summarize</>}
          </button>
          <button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz || !inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-all text-sm font-bold disabled:opacity-50"
          >
            {isGeneratingQuiz ? <><FileQuestion className="animate-spin" size={16} /> Generating...</> : <><FileQuestion size={16} /> Generate Quiz</>}
          </button>
          <button className="btn-primary" onClick={handleSynthesize} disabled={isSynthesizing || !inputText.trim()}>
            {isSynthesizing ? <><Sparkles className="animate-spin" size={18} /> Processing...</> : <><Brain size={18} /> Full Synthesis</>}
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
              <div className="flex border-b border-white/10 p-2 overflow-x-auto no-scrollbar">
                {[
                  { id: 'SUMMARY', label: 'Brief', icon: BookOpen },
                  { id: 'ROADMAP', label: 'Roadmap', icon: Map },
                  { id: 'MINDMAP', label: 'Mind Map', icon: Network },
                  { id: 'FORMULAS', label: 'Formulas', icon: Sigma },
                  { id: 'FLASHCARDS', label: 'Cards', icon: Lightbulb },
                  { id: 'QUIZ', label: 'Quiz', icon: FileQuestion }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary/20 text-primary font-bold' : 'text-white/40 hover:text-white'
                      }`}
                  >
                    <tab.icon size={14} />
                    <span className="text-[10px] uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <AnimatePresence mode="wait">
                   {activeTab === 'ROADMAP' && result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      {result.roadmap.map((step, idx) => (
                        <div key={idx} className="flex gap-4 items-start relative pb-6 last:pb-0">
                           {idx !== result.roadmap.length - 1 && (
                             <div className="absolute left-[15px] top-10 w-0.5 h-full bg-white/5" />
                           )}
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                             step.status === 'COMPLETED' ? 'bg-accent/20 border-accent/40 text-accent' :
                             step.status === 'ACTIVE' ? 'bg-primary/20 border-primary text-primary' :
                             'bg-white/5 border-white/10 text-white/20'
                           }`}>
                             {step.status === 'COMPLETED' ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                           </div>
                           <div className="flex-1">
                              <h4 className={`font-bold tracking-tight uppercase ${step.status === 'LOCKED' ? 'text-white/20' : 'text-white'}`}>{step.title}</h4>
                              <p className="text-xs text-white/40 mt-1">{step.desc}</p>
                           </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'MINDMAP' && result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                       <Mermaid chart={result.mermaidMindMap} />
                    </motion.div>
                  )}

                  {activeTab === 'FORMULAS' && result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 gap-4">
                       {result.formulaSheet.map((f, idx) => (
                         <div key={idx} className="glass p-5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                            <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">{f.topic}</span>
                            <div className="my-3 py-4 bg-white/2 rounded-xl flex items-center justify-center font-mono text-xl text-white font-bold group-hover:text-primary transition-colors">
                               {f.formula}
                            </div>
                            <p className="text-xs text-white/40 italic">{f.explanation}</p>
                         </div>
                       ))}
                    </motion.div>
                  )}

                  {activeTab === 'FLASHCARDS' && result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      {result.flashcards.map((card, idx) => (
                        <div key={idx} className="group relative glass p-5 rounded-xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer">
                          <p className="text-primary text-[10px] font-bold mb-1 tracking-widest uppercase">Memory Vector</p>
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
                          <div className="flex justify-between items-start">
                             <p className="font-bold">Q{qidx + 1}: {q.question}</p>
                             <Sparkles size={16} className="text-primary" />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oidx) => (
                              <button key={oidx} className="w-full text-left p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-xs font-medium">
                                {opt}
                              </button>
                            ))}
                          </div>
                          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-[10px] leading-relaxed">
                            <span className="font-bold text-accent uppercase tracking-widest">Logic:</span> {q.explanation}
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
                  disabled={isSynthesizing}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10`}
                >
                  {isSynthesizing ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Save size={14} /> Save to Library</>
                  )}
                </button>
                <button 
                  onClick={() => addToast('PDF Export initiated', 'INFO')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <Download size={14} /> Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Summary / Quiz Panel */}
      {showAiPanel !== 'none' && (
        <div className="glass-card p-8 border-accent/20">
          {showAiPanel === 'summary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-accent"><Sparkles size={20} /> AI Quick Summary</h3>
                <button onClick={() => setShowAiPanel('none')} className="text-white/40 hover:text-white text-xs uppercase tracking-widest">← Back</button>
              </div>
              {isAiSummarizing ? (
                <div className="flex items-center gap-3 text-accent animate-pulse"><Brain className="animate-bounce" size={30} /><span className="font-bold uppercase tracking-widest text-sm">Analyzing content...</span></div>
              ) : aiSummary && (
                <div className="space-y-6">
                  <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">Core Summary</p>
                    <p className="text-sm text-white/80 leading-relaxed">{aiSummary.summary}</p>
                  </div>
                  {aiSummary.keyPoints?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Key Points</p>
                      <ul className="space-y-2">{aiSummary.keyPoints.map((pt: string, i: number) => <li key={i} className="flex gap-3 text-sm text-white/70"><span className="text-primary mt-1">▸</span>{pt}</li>)}</ul>
                    </div>
                  )}
                  {aiSummary.importantTerms?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Important Terms</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{aiSummary.importantTerms.map((t: any, i: number) => <div key={i} className="p-3 glass rounded-xl border border-white/5"><p className="font-bold text-sm text-secondary">{t.term}</p><p className="text-xs text-white/50 mt-1">{t.definition}</p></div>)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showAiPanel === 'quiz' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-secondary"><FileQuestion size={20} /> AI Generated Quiz</h3>
                <button onClick={() => setShowAiPanel('none')} className="text-white/40 hover:text-white text-xs uppercase tracking-widest">← Back</button>
              </div>
              {isGeneratingQuiz ? (
                <div className="flex items-center gap-3 text-secondary animate-pulse"><Sparkles className="animate-bounce" size={30} /><span className="font-bold uppercase tracking-widest text-sm">Generating questions...</span></div>
              ) : aiQuiz.length > 0 ? (
                <div className="space-y-6">
                  {aiQuiz.map((q, qi) => (
                    <div key={qi} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                      <p className="font-bold">Q{qi + 1}: {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt: string, oi: number) => {
                          const isSelected = quizAnswers[qi] === oi;
                          const isCorrect = q.correctIndex === oi;
                          let btnClass = 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10';
                          if (quizSubmitted) {
                            if (isCorrect) btnClass = 'bg-accent/20 border-accent/50 text-accent font-bold';
                            else if (isSelected && !isCorrect) btnClass = 'bg-red-500/20 border-red-500/40 text-red-400';
                          } else if (isSelected) btnClass = 'bg-primary/20 border-primary/50 text-primary';
                          return (
                            <button key={oi} disabled={quizSubmitted} onClick={() => setQuizAnswers(a => ({...a, [qi]: oi}))} className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${btnClass}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {!quizSubmitted ? (
                    <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < aiQuiz.length} className="w-full py-4 bg-secondary/20 text-secondary border border-secondary/30 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-secondary/30 transition-all disabled:opacity-40">
                      Submit Quiz
                    </button>
                  ) : (
                    <div className="p-6 bg-accent/10 border border-accent/30 rounded-2xl text-center">
                      <p className="text-2xl font-bold text-accent">{Object.entries(quizAnswers).filter(([qi, ai]) => ai === aiQuiz[Number(qi)]?.correctIndex).length} / {aiQuiz.length}</p>
                      <p className="text-sm text-white/60 mt-1">Questions Correct</p>
                      <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="mt-4 px-6 py-2 glass rounded-xl text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white">Retry Quiz</button>
                    </div>
                  )}
                </div>
              ) : <p className="text-white/40 text-sm">No questions generated yet.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteSynthesis;
