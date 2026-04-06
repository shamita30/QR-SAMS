export type Role = 'ADMIN' | 'FACULTY' | 'HOD' | 'STUDENT' | 'STAFF';

export interface User {
  id: string;
  username: string;
  role: Role;
  department?: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  courseId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  timestamp: string;
  department: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  studentId: string;
  department: string;
  status: 'PROPOSAL' | 'IN_PROGRESS' | 'COMPLETED';
  proposal?: string;
  code?: string;
  milestones: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  status: 'LOCKED' | 'CURRENT' | 'COMPLETED';
}

export interface NoteSynthesisResult {
  summary: string;
  keyPoints: string[];
  roadmap: Array<{ title: string; desc: string; status: 'COMPLETED' | 'ACTIVE' | 'LOCKED' }>;
  mermaidMindMap: string;
  formulaSheet: Array<{ topic: string; formula: string; explanation: string }>;
  flashcards: Array<{ question: string; answer: string }>;
  quiz: Array<{ question: string; options: string[]; answer: string; explanation: string }>;
}
