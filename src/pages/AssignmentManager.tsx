import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Clock, Target, 
  Send, Cpu, Brain, Shield, ChevronRight,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { api } from '../services/api';

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  due_date: string;
  max_marks: number;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  content: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
}

const AssignmentManager: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGrading, setIsGrading] = useState<string | null>(null); // submissionId

  // Create Assignment State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState(100);

  const isStaff = user?.role === 'FACULTY' || user?.role === 'HOD' || user?.role === 'ADMIN';

  const fetchAssignments = async () => {
    try {
      const res = await api.fetch('/api/assignments');
      if (res.ok) setAssignments(await res.json());
    } catch (e) {
      addToast('Critical sync failure.', 'ERROR');
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const res = await api.fetch(`/api/submissions/${assignmentId}`);
      if (res.ok) setSubmissions(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async () => {
    if (!user) return;
    try {
      const res = await api.fetch('/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          instructorId: user.id,
          dueDate: newDueDate,
          maxMarks: newMaxMarks
        })
      });
      if (res.ok) {
        addToast('Assignment protocol deployed.', 'SUCCESS');
        setShowCreateModal(false);
        fetchAssignments();
      }
    } catch (e) {
      addToast('Deployment failed.', 'ERROR');
    }
  };

  const handleSubmitWork = async () => {
    if (!selectedAssignment || !user) return;
    setIsSubmitting(true);
    try {
      const res = await api.fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          studentId: user.id,
          content: submissionContent
        })
      });
      if (res.ok) {
        addToast('Data packet transmitted.', 'SUCCESS');
        setSubmissionContent('');
        setSelectedAssignment(null);
      }
    } catch (e) {
      addToast('Transmission failure.', 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGrade = async (submission: Submission) => {
    if (!selectedAssignment) return;
    setIsGrading(submission.id);
    try {
      const res = await api.fetch('/api/ai/grade-submission', {
        method: 'POST',
        body: JSON.stringify({
          submissionId: submission.id,
          content: submission.content,
          assignmentDesc: selectedAssignment.description,
          maxMarks: selectedAssignment.max_marks
        })
      });
      if (res.ok) {
        addToast('Neural evaluation complete.', 'SUCCESS');
        fetchSubmissions(selectedAssignment.id);
      }
    } catch (e) {
      addToast('AI processing error.', 'ERROR');
    } finally {
      setIsGrading(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
            Faculty Oversight
          </h2>
          <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
            Strategic Assignments
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            Deploy curriculum tasks and analyze student performance through neural sharding.
          </p>
        </div>
        {isStaff && (
          <NeonButton onClick={() => setShowCreateModal(true)} className="pr-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Plus size={18} /> Deploy New Task
          </NeonButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Active Protocols</h3>
            <span className="text-[10px] font-mono text-primary">{assignments.length} NODES</span>
          </div>
          
          <div className="space-y-4">
            {assignments.map((asgn) => (
              <motion.div
                key={asgn.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedAssignment(asgn);
                  if (isStaff) fetchSubmissions(asgn.id);
                }}
                className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                  selectedAssignment?.id === asgn.id 
                    ? 'bg-primary/20 border-primary shadow-[0_0_25px_rgba(59,130,246,0.2)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <Target size={20} className={selectedAssignment?.id === asgn.id ? 'text-primary' : 'text-white/40'} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-1">Due Date</p>
                    <p className="text-xs font-bold text-white/60">{asgn.due_date}</p>
                  </div>
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-white mb-1 group-hover:text-primary transition-colors">
                  {asgn.title}
                </h4>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic truncate">
                  Instructor: {asgn.instructor_name}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-1.5">
                      <Shield size={12} className="text-primary/40" />
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Tier {asgn.max_marks / 10} Protocol</span>
                   </div>
                   <ChevronRight size={14} className="text-white/10" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Workspace / Submissions */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!selectedAssignment ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[500px] glass rounded-[3rem] border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center p-12"
              >
                <Cpu size={64} className="text-white/10 mb-6 animate-pulse" />
                <h3 className="text-xl font-bold uppercase tracking-tighter text-white/20 italic">Select Protocol for Sync</h3>
                <p className="text-white/10 text-xs mt-2 uppercase tracking-widest font-bold">Waiting for node authorization...</p>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <GlassCard className="p-10 border-primary/20 relative overflow-hidden" hover={false}>
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -rotate-12">
                     <FileText size={160} className="text-primary" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                       <span className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Active Sector</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                       <span className="text-[10px] font-mono text-white/40">{selectedAssignment.id}</span>
                    </div>
                    <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">{selectedAssignment.title}</h2>
                    <div className="p-6 bg-white/2 rounded-2xl border border-white/5 text-sm font-medium text-white/60 leading-relaxed mb-8">
                       {selectedAssignment.description}
                    </div>

                    {!isStaff ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Transmission Terminal</h4>
                           <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Characters: {submissionContent.length} / 5000</span>
                        </div>
                        <textarea
                          placeholder="Paste your analysis or code segment here..."
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                          className="w-full h-64 bg-black/40 border border-white/10 rounded-3xl p-6 font-mono text-xs text-primary/80 outline-none focus:border-primary/40 transition-all resize-none shadow-inner"
                        />
                        <NeonButton 
                          onClick={handleSubmitWork}
                          className={`w-full py-5 text-sm uppercase tracking-[0.4em] font-black group ${(isSubmitting || !submissionContent.trim()) ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <Send size={18} className="group-hover:translate-x-2 transition-transform" /> {isSubmitting ? 'Transmitting...' : 'Upload Data to Sentinel'}
                        </NeonButton>
                      </div>
                    ) : (
                      <div className="space-y-6 pb-2">
                        <div className="flex items-center justify-between px-2">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Submissions Pipeline</h4>
                           <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">{submissions.length} Nodes Detected</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {submissions.length === 0 ? (
                            <div className="p-12 border-dashed border-2 border-white/5 rounded-[2rem] text-center italic text-white/20 text-xs">
                               No submissions detected in this sector.
                            </div>
                          ) : (
                            submissions.map((sub) => (
                              <GlassCard key={sub.id} className="p-6 border-white/5 bg-white/2 hover:border-accent/30 group">
                                <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center font-bold text-accent font-outfit">
                                        {sub.student_name.charAt(0)}
                                     </div>
                                     <div>
                                        <p className="font-bold text-sm text-white uppercase tracking-tight">{sub.student_name}</p>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">SUB_ID: {sub.id.substring(0,8)}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     {sub.grade !== null ? (
                                        <div className="p-3 bg-accent/20 border border-accent/40 rounded-2xl">
                                           <p className="text-[8px] font-bold text-accent uppercase tracking-widest mb-0.5">Grade Assigned</p>
                                           <p className="text-xl font-bold text-white italic">{sub.grade} <span className="text-xs opacity-40">/ {selectedAssignment.max_marks}</span></p>
                                        </div>
                                     ) : (
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                                           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5 italic">Pending Eval</p>
                                           <p className="text-xl font-bold text-white/10">--</p>
                                        </div>
                                     )}
                                  </div>
                                </div>
                                
                                <div className="p-6 bg-black/20 rounded-xl font-mono text-[10px] text-white/40 line-clamp-3 mb-6 border border-white/5 italic">
                                   {sub.content}
                                </div>

                                {sub.feedback && (
                                   <div className="mb-6 px-4 py-3 bg-accent/5 border-l-2 border-accent text-[10px] italic text-accent/80 leading-relaxed font-medium">
                                      <span className="font-bold uppercase tracking-widest block not-italic mb-1 opacity-60">Neural Feedback:</span>
                                      {sub.feedback}
                                   </div>
                                )}

                                <div className="flex gap-4">
                                   <NeonButton 
                                     variant="secondary"
                                     onClick={() => handleAIGrade(sub)}
                                     className={`flex-1 py-3 text-[10px] uppercase tracking-[0.2em] border-accent/40 hover:bg-accent/10 ${isGrading === sub.id ? 'opacity-50 pointer-events-none' : ''}`}
                                   >
                                      {isGrading === sub.id ? (
                                        <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                                      ) : (
                                        <><Brain size={14} className="text-accent" /> Neural Evaluation</>
                                      )}
                                   </NeonButton>
                                   <button className="px-6 py-3 glass rounded-xl border-white/5 hover:border-white/20 text-white/40 hover:text-white transition-all">
                                      <Download size={16} />
                                   </button>
                                </div>
                              </GlassCard>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowCreateModal(false)} />
             <motion.div 
               initial={{ scale: 0.9, y: 40, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }} 
               exit={{ scale: 0.9, y: 40, opacity: 0 }} 
               className="relative w-full max-w-2xl glass p-10 rounded-[3rem] border border-white/10 shadow-2xl"
             >
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h3 className="text-2xl font-bold uppercase tracking-tighter">Deploy New Protocol</h3>
                     <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">Configure curriculum task deployment</p>
                   </div>
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                      <Plus size={24} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2 italic">Assignment Title</label>
                      <input 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-white/2 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary/50 text-sm font-bold placeholder:text-white/10" 
                        placeholder="e.g. Neural Sharding & Data Vectors" 
                      />
                   </div>
                   <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2 italic">Assignment Brief</label>
                      <textarea 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full h-40 bg-white/2 border border-white/10 rounded-3xl p-6 outline-none focus:border-primary/50 text-sm font-medium placeholder:text-white/10 resize-none leading-relaxed" 
                        placeholder="Describe the operational objectives..." 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2 italic">Due Date</label>
                      <div className="relative">
                        <input 
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="w-full bg-white/2 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary/50 text-xs font-mono" 
                        />
                        <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/10" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2 italic">Tier (Max Marks)</label>
                      <input 
                        type="number"
                        value={newMaxMarks}
                        onChange={(e) => setNewMaxMarks(parseInt(e.target.value))}
                        className="w-full bg-white/2 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary/50 text-xs font-mono font-bold" 
                      />
                   </div>
                </div>

                <div className="mt-10 flex gap-4">
                   <NeonButton onClick={handleCreateAssignment} className="flex-1 py-4 uppercase tracking-[0.3em] font-black italic">
                      Finalize Deployment
                   </NeonButton>
                   <button onClick={() => setShowCreateModal(false)} className="px-8 glass rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white hover:border-white/20 transition-all">
                      Cancel
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentManager;
