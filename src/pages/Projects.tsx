import React, { useState, useEffect } from 'react';
import { 
  FileText, Code2, FileQuestion, 
  Map, Send, CheckCircle2, 
  Ban, FileSpreadsheet, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const Projects: React.FC = () => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalAbstract, setProposalAbstract] = useState('');
  const [activeTab, setActiveTab] = useState<'PROPOSAL' | 'WORKSPACE' | 'QUIZ' | 'ROADMAP'>('PROPOSAL');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [code, setCode] = useState('// Your project code here\n#include <stdio.h>\n\nint main() {\n  printf("Sentinel Project Workspace\\n");\n  return 0;\n}');
  const [hodFilter, setHodFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'GRADED'>('ALL');

  const isStudent = user?.role === 'STUDENT';
  const isHOD = user?.role === 'HOD';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const url = isStudent 
        ? `http://localhost:3001/api/projects?studentId=${user.id}`
        : `http://localhost:3001/api/projects?department=${user.department}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          const latest = data[0];
          setSelectedProject(latest);
          setProposalTitle(latest.title);
          setProposalAbstract(latest.description);
          if (latest.code) setCode(latest.code);
        }
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="text-primary" /> Integrated Projects
          </h1>
          <p className="text-white/50">{isStudent ? 'Build and submit your curriculum projects' : 'Review and grade student submissions'}</p>
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/5">
          {[
            { id: 'PROPOSAL', label: 'Proposal', icon: FileText },
            { id: 'WORKSPACE', label: 'Workspace', icon: Code2 },
            { id: 'QUIZ', label: 'Project Quiz', icon: FileQuestion },
            { id: 'ROADMAP', label: 'Roadmap', icon: Map }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'PROPOSAL' && (
          <motion.div key="proposal" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{isStudent ? 'Your Projects' : isHOD ? 'Department Projects' : 'Student Proposals'}</h2>
                {isHOD && (
                  <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'GRADED'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setHodFilter(f as any)}
                        className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${hodFilter === f ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-white/40 hover:text-white'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {projects.filter(p => !isHOD || hodFilter === 'ALL' || (hodFilter === 'PENDING' && p.status === 'PROPOSAL') || p.status === hodFilter).length === 0 ? (
                  <p className="text-sm text-white/30 italic">No projects found.</p>
                ) : (
                  projects.filter(p => !isHOD || hodFilter === 'ALL' || (hodFilter === 'PENDING' && p.status === 'PROPOSAL') || p.status === hodFilter).map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setSelectedProject(p);
                        setProposalTitle(p.title);
                        setProposalAbstract(p.description);
                        if (p.code) setCode(p.code);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedProject?.id === p.id ? 'bg-primary/10 border-primary/40' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm">{p.title}</h3>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${p.status === 'COMPLETED' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>{p.status}</span>
                      </div>
                      <p className="text-[10px] text-white/40 line-clamp-1">{p.description}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <h2 className="text-lg font-bold mb-4">{selectedProject ? 'Edit' : 'New'} Project Proposal</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Project Title</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50" 
                      placeholder="e.g. Smart IoT Dashboard" 
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Abstract</label>
                    <textarea 
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary/50 text-sm" 
                      placeholder="Briefly describe the objective and methodology..." 
                      value={proposalAbstract}
                      onChange={(e) => setProposalAbstract(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        const res = await fetch('http://localhost:3001/api/projects', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: selectedProject?.id,
                            title: proposalTitle,
                            description: proposalAbstract,
                            studentId: user.id,
                            department: user.department || 'General',
                            status: selectedProject?.status || 'PROPOSAL',
                            proposal: proposalAbstract,
                            code: code
                          })
                        });
                        if (res.ok) {
                          setSubmitStatus('SUCCESS');
                          fetchProjects();
                          if (!selectedProject) {
                            setProposalTitle('');
                            setProposalAbstract('');
                          }
                          setTimeout(() => setSubmitStatus('IDLE'), 3000);
                        } else {
                          setSubmitStatus('ERROR');
                        }
                      } catch (e) {
                        setSubmitStatus('ERROR');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting || !proposalTitle || !proposalAbstract}
                    className="w-full btn-primary py-4 justify-center"
                  >
                    {isSubmitting ? 'Submitting...' : submitStatus === 'SUCCESS' ? 'Saved Successfully!' : selectedProject ? 'Update Proposal' : 'Submit Proposal to Faculty'}
                  </button>
                </div>
              </div>
            </div>
            
            {isStudent ? (
              <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/20 text-primary">
                  <Send size={40} />
                </div>
                <h3 className="text-xl font-bold">Proposal Guidelines</h3>
                <p className="text-sm text-white/50 mt-4 leading-relaxed">Ensure your project addresses a real-world problem within your department scope. All proposals must be approved before the Virtual Lab environment is unlocked for development.</p>
                <div className="mt-8 flex gap-2">
                  <CheckCircle2 className="text-accent" size={16} />
                  <span className="text-xs text-white/60">Verified for Semester 7 syllabus</span>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 bg-gradient-to-br from-accent/5 to-transparent flex flex-col items-center text-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6 border border-accent/20 text-accent relative z-10">
                  <FileSpreadsheet size={40} />
                </div>
                <h3 className="text-xl font-bold relative z-10">{isHOD ? 'HOD Project Approvals' : 'Faculty Evaluation Panel'}</h3>
                <p className="text-sm text-white/50 mt-4 leading-relaxed relative z-10">
                  {isHOD ? 'Review and formally approve department project proposals before students enter the development phase.' : 'Grade student submissions individually or use the bulk upload tool to import marks from a CSV sheet directly into the system database.'}
                </p>
                
                <div className="mt-8 w-full space-y-4 relative z-10">
                  {isHOD && selectedProject?.status === 'PROPOSAL' && (
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch('http://localhost:3001/api/projects', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...selectedProject, status: 'APPROVED' })
                          });
                          if (res.ok) alert('Project proposal approved.');
                          fetchProjects();
                        } catch (e) { console.error(e); }
                      }}
                      className="w-full btn-primary py-4 justify-center flex items-center gap-2 mb-4"
                    >
                      <CheckCircle2 size={18} /> Approve Project Proposal
                    </button>
                  )}
                  {!isHOD && (
                    <button 
                      onClick={async () => {
                      if (!projects || projects.length === 0) {
                        alert("No projects to grade.");
                        return;
                      }
                      const mockUpdates = projects.map(p => ({
                        id: p.id,
                        status: 'GRADED',
                        grade: Math.floor(Math.random() * 30) + 70
                      }));
                      try {
                        const res = await fetch('http://localhost:3001/api/projects/bulk-update', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ updates: mockUpdates })
                        });
                        if (res.ok) {
                          alert(`Successfully bulk graded ${mockUpdates.length} projects.`);
                          fetchProjects();
                        } else {
                          alert('Failed to update projects.');
                        }
                      } catch (e) {
                         alert('Bulk grade failed.');
                      }
                    }}
                    className="w-full btn-secondary py-4 justify-center flex items-center gap-2 border-accent/30 hover:border-accent hover:bg-accent/10"
                  >
                    <Upload size={18} className="text-accent" /> Bulk Upload Marks (CSV)
                  </button>
                  )}
                  {!isHOD && <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2 block">Uploads mock data for testing</p>}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'WORKSPACE' && (
          <motion.div key="workspace" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6 h-[calc(100vh-14rem)] flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/20 text-accent rounded-full text-[10px] font-bold border border-accent/20">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  WORKSPACE ACTIVE
                </div>
                <span className="text-xs font-mono text-white/40">main.c</span>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold">
                  <Ban size={12} /> NO COPY-PASTE ZONE
                </div>
                <button className="btn-secondary py-1 text-xs">Run Code</button>
              </div>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPaste={(e) => { e.preventDefault(); alert("Security Policy: Copy-paste is disabled in the project workspace to prevent code duplication."); }}
              className="flex-1 bg-black/40 border border-white/5 rounded-xl p-6 font-mono text-sm leading-relaxed outline-none focus:border-primary/50 text-cyan-400/90 resize-none selection:bg-primary/30"
            />
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/40">
              <p className="text-white/60 mb-2 font-bold uppercase tracking-widest text-[10px]">Compilation Console</p>
              <p>{'>'} gcc main.c -o output</p>
              <p>{'>'} ./output</p>
              <p className="text-accent">{'>'} Sentinel Project Workspace</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'QUIZ' && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500">
                <FileQuestion size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Weekly Tech Review</h2>
                <p className="text-sm text-white/50 italic">Generated based on your Project Tech Stack</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass p-6 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-lg font-medium mb-4">What is the primary advantage of using a modular component architecture in a React-based monitoring project?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Easier debugging and reuse', 'Faster initial load only', 'Reduction in database size', 'Automatic SEO optimization'].map((opt, i) => (
                    <button key={i} className={`text-left p-4 rounded-xl border border-white/10 text-sm transition-all hover:bg-primary/10 hover:border-primary/30 ${i===0 ? 'bg-primary/5 border-primary/20' : ''}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/20 flex gap-3 text-xs leading-relaxed">
                  <CheckCircle2 className="text-accent shrink-0" size={16} />
                  <div>
                    <span className="font-bold text-accent uppercase tracking-widest block mb-1">Correct Answer & Explanation</span>
                    Modular architecture allows for isolated testing of components and promotes DRY (Don't Repeat Yourself) principles, making the large project easier to maintain over time.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ROADMAP' && (
          <motion.div key="roadmap" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <Map className="text-primary mb-6" size={64} />
            <h2 className="text-2xl font-bold italic underline decoration-primary">PROJECT MILESTONES</h2>
            <div className="mt-12 flex items-center gap-12 relative w-full max-w-2xl justify-between">
              <div className="absolute h-1 bg-white/10 left-12 right-12 top-6 -z-10" />
              {[
                { id: 1, label: 'Ideation', status: 'COMPLETED' },
                { id: 2, label: 'UI Draft', status: 'COMPLETED' },
                { id: 3, label: 'Logic HW', status: 'ACTIVE' },
                { id: 4, label: 'Final Test', status: 'LOCKED' }
              ].map(step => (
                <div key={step.id} className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${
                    step.status === 'COMPLETED' ? 'bg-accent border-accent text-white' : 
                    step.status === 'ACTIVE' ? 'bg-primary border-primary animate-pulse' : 'bg-white/5 border-white/10'
                  }`}>
                    {step.id}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${step.status === 'LOCKED' ? 'text-white/20' : 'text-white/60'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
