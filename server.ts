import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'PLACEHOLDER');
const JWT_SECRET = process.env.JWT_SECRET || 'sentinel-protocol-nexus-delta-9';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Hackerman-style logging middleware
app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const cyan = "\x1b[36m", green = "\x1b[32m", yellow = "\x1b[33m", red = "\x1b[31m", reset = "\x1b[0m", magenta = "\x1b[35m";
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    let statusColor = green;
    if (status >= 400) statusColor = yellow;
    if (status >= 500) statusColor = red;
    if (!req.originalUrl.startsWith('/socket.io')) {
      console.log(`${magenta}[SYS-LOG]${reset} ${cyan}${timestamp}${reset} | ${green}${req.method}${reset} ${req.originalUrl} | STATUS: ${statusColor}${status}${reset} | ${yellow}${duration}ms${reset} | IP: ${req.ip}`);
    }
  });
  next();
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

const db = new Database('sentinel.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    department TEXT,
    name TEXT,
    email TEXT,
    phone_number TEXT,
    parent_phone TEXT
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT,
    dept TEXT,
    time TEXT,
    faculty_id TEXT,
    FOREIGN KEY(faculty_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    FOREIGN KEY(session_id) REFERENCES attendance_sessions(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(session_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS action_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action_type TEXT,
    path TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    department TEXT,
    submission_date TEXT,
    proposal TEXT,
    code TEXT,
    grade INTEGER,
    FOREIGN KEY(student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    content TEXT,
    summary TEXT,
    key_points TEXT,
    roadmap TEXT,
    mermaid_mind_map TEXT,
    formula_sheet TEXT,
    flashcards TEXT,
    quiz TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    title TEXT,
    level TEXT,
    description TEXT,
    icon TEXT,
    earned BOOLEAN,
    xp INTEGER,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id TEXT PRIMARY KEY,
    time TEXT,
    title TEXT,
    room TEXT,
    type TEXT,
    color TEXT,
    dept TEXT
  );

  CREATE TABLE IF NOT EXISTS tutors (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    expert TEXT,
    rating REAL,
    sessions INTEGER,
    color TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tutoring_requests (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    topic TEXT,
    status TEXT,
    date TEXT,
    FOREIGN KEY(student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS lounges (
    id TEXT PRIMARY KEY,
    title TEXT,
    host_id TEXT,
    members INTEGER,
    date TEXT,
    time TEXT,
    is_private BOOLEAN,
    FOREIGN KEY(host_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS global_chat (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS broadcasts (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    author TEXT,
    role_target TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS broadcast_history (
    id TEXT PRIMARY KEY,
    message TEXT,
    author TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT,
    owner_id TEXT,
    status TEXT DEFAULT 'AVAILABLE',
    requestor_id TEXT,
    FOREIGN KEY(owner_id) REFERENCES users(id),
    FOREIGN KEY(requestor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sentiment_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    mood TEXT,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance_sessions (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    faculty_id TEXT,
    token TEXT UNIQUE,
    department TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(faculty_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    user_id TEXT,
    text TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'SENT',
    FOREIGN KEY(room_id) REFERENCES chat_rooms(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS study_progress (
    user_id TEXT,
    node_id INTEGER,
    status TEXT DEFAULT 'LOCKED',
    xp_earned INTEGER DEFAULT 0,
    PRIMARY KEY(user_id, node_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    instructor_id TEXT,
    due_date TEXT,
    max_marks INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(instructor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT,
    student_id TEXT,
    content TEXT,
    grade INTEGER,
    feedback TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(assignment_id) REFERENCES assignments(id),
    FOREIGN KEY(student_id) REFERENCES users(id)
  );


  CREATE TABLE IF NOT EXISTS session_feedback (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    student_id TEXT,
    emoji TEXT,
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES attendance_sessions(id),
    FOREIGN KEY(student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS note_quizzes (
    id TEXT PRIMARY KEY,
    note_id TEXT,
    question TEXT,
    options TEXT,
    correct_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

`);

// Dynamic altering for new geo-location columns
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN latitude REAL"); } catch(e) {}
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN longitude REAL"); } catch(e) {}
try { db.exec("ALTER TABLE attendance ADD COLUMN latitude REAL"); } catch(e) {}
try { db.exec("ALTER TABLE attendance ADD COLUMN longitude REAL"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN phone_number TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN parent_phone TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE attendance ADD COLUMN od_letter_url TEXT"); } catch(e) {}

// Helper for Haversine distance
function getDistanceInMeters(lat1: number | null, lon1: number | null, lat2: number | null, lon2: number | null) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371e3; // metres
  const \u03c61 = lat1 * Math.PI/180;
  const \u03c62 = lat2 * Math.PI/180;
  const \u0394\u03c6 = (lat2-lat1) * Math.PI/180;
  const \u0394\u03bb = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(\u0394\u03c6/2) * Math.sin(\u0394\u03c6/2) +
            Math.cos(\u03c61) * Math.cos(\u03c62) *
            Math.sin(\u0394\u03bb/2) * Math.sin(\u0394\u03bb/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function seedDatabase() {
  console.log('\x1b[35m[SEED]\x1b[0m \x1b[36mInitializing Sentinel Campus Data Layer...\x1b[0m');
  const hashedPassword = bcrypt.hashSync('password', 10);
  const seedUser = db.prepare('INSERT OR REPLACE INTO users (id, username, password, role, name, department, email, phone_number, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');


  // Admin, HOD, Faculty
  seedUser.run('admin-sys', 'admin',   hashedPassword, 'ADMIN',   'Kavitha Rajan',        'IT',  'admin@sentinel.edu', '9876543210', '9876543211');
  seedUser.run('hod-cse',  'hod',     hashedPassword, 'HOD',     'Dr. Arul Prasad',       'CSE', 'hod@sentinel.edu',   '9876543220', '9876543221');
  seedUser.run('fac-cse',  'faculty', hashedPassword, 'FACULTY', 'Prof. Saravanan Kumar', 'CSE', 'saravanan@sentinel.edu', '9876543230', '9876543231');
  seedUser.run('fac-it',   'faculty2',hashedPassword, 'FACULTY', 'Prof. Deepa Nair',      'IT',  'deepa@sentinel.edu', '9876543240', '9876543241');

  // 20 Realistic Students
  const students = [
    ['s1',  'student',   'Arjun Ramesh',      'CSE', 'arjun@sentinel.edu',  '9150010001', '9150020001'],
    ['s2',  'student2',  'Priya Krishnan',     'CSE', 'priya@sentinel.edu',  '9150010002', '9150020002'],
    ['s3',  'student3',  'Karthik Pillai',     'CSE', 'karthik@sentinel.edu','9150010003', '9150020003'],
    ['s4',  'student4',  'Meera Suresh',       'CSE', 'meera@sentinel.edu',  '9150010004', '9150020004'],
    ['s5',  'student5',  'Rohan Menon',        'CSE', 'rohan@sentinel.edu',  '9150010005', '9150020005'],
    ['s6',  'student6',  'Ananya Iyer',        'CSE', 'ananya@sentinel.edu', '9150010006', '9150020006'],
    ['s7',  'student7',  'Vishnu Chandran',    'CSE', 'vishnu@sentinel.edu', '9150010007', '9150020007'],
    ['s8',  'student8',  'Sneha Raghavan',     'CSE', 'sneha@sentinel.edu',  '9150010008', '9150020008'],
    ['s9',  'student9',  'Aditya Nair',        'IT',  'aditya@sentinel.edu', '9150010009', '9150020009'],
    ['s10', 'student10', 'Divya Mohan',        'IT',  'divya@sentinel.edu',  '9150010010', '9150020010'],
    ['s11', 'student11', 'Sandeep Varma',      'IT',  'sandeep@sentinel.edu','9150010011', '9150020011'],
    ['s12', 'student12', 'Pooja Balasubramaniam','IT', 'pooja@sentinel.edu',  '9150010012', '9150020012'],
    ['s13', 'student13', 'Rahul Shankar',      'IT',  'rahul@sentinel.edu',  '9150010013', '9150020013'],
    ['s14', 'student14', 'Kavya Menon',        'CSE', 'kavya@sentinel.edu',  '9150010014', '9150020014'],
    ['s15', 'student15', 'Nikhil Thomas',      'CSE', 'nikhil@sentinel.edu', '9150010015', '9150020015'],
    ['s16', 'student16', 'Lakshmi Priya',      'IT',  'lakshmi@sentinel.edu','9150010016', '9150020016'],
    ['s17', 'student17', 'Harish Kumar',       'CSE', 'harish@sentinel.edu', '9150010017', '9150020017'],
    ['s18', 'student18', 'Sreevidya Nair',     'IT',  'sreevidya@sentinel.edu','9150010018', '9150020018'],
    ['s19', 'student19', 'Ajith Krishnan',     'CSE', 'ajith@sentinel.edu',  '9150010019', '9150020019'],
    ['s20', 'student20', 'Nithya Suresh',      'IT',  'nithya@sentinel.edu', '9150010020', '9150020020'],
  ];
  students.forEach(([id, username, name, dept, email, phone, parentPhone]) => {
    seedUser.run(id, username, hashedPassword, 'STUDENT', name, dept, email, phone, parentPhone);
  });

  // Courses
  if ((db.prepare('SELECT COUNT(*) as count FROM courses').get() as any).count === 0) {
    const insertCourse = db.prepare('INSERT INTO courses (id, name, dept, time, faculty_id) VALUES (?, ?, ?, ?, ?)');
    insertCourse.run('CS301', 'Cloud Computing',          'CSE', '10:00 AM', 'fac-cse');
    insertCourse.run('CS302', 'Database Systems',         'CSE', '11:30 AM', 'fac-cse');
    insertCourse.run('CS303', 'Machine Learning',         'CSE', '01:00 PM', 'fac-cse');
    insertCourse.run('CS304', 'Computer Networks',        'CSE', '03:00 PM', 'fac-cse');
    insertCourse.run('IT201', 'Full Stack Web Dev',       'IT',  '02:00 PM', 'fac-it');
    insertCourse.run('IT202', 'Cyber Security',           'IT',  '09:00 AM', 'fac-it');
    insertCourse.run('IT203', 'DevOps & CI/CD',           'IT',  '04:00 PM', 'fac-it');
  }

  // Badges
  if ((db.prepare('SELECT COUNT(*) as count FROM badges').get() as any).count === 0) {
    const insertBadge = db.prepare('INSERT INTO badges (id, title, level, description, icon, earned) VALUES (?, ?, ?, ?, ?, ?)');
    insertBadge.run('b1', 'Cloud Pioneer',     'Pro',    'Mastered AWS/Azure cloud deployments',          'Cloud',   1);
    insertBadge.run('b2', 'Code Architect',    'Expert', 'Excellence in software system design',          'Code',    1);
    insertBadge.run('b3', 'Bug Hunter',        'Elite',  'Identified 50+ critical vulnerabilities',       'Shield',  0);
    insertBadge.run('b4', 'AI Virtuoso',       'Pro',    'Implemented machine learning pipelines',        'Brain',   0);
    insertBadge.run('b5', 'Data Wizard',       'Pro',    'Advanced analytics and database skills',        'Chart',   1);
    insertBadge.run('b6', 'Security Sentinel', 'Expert', 'Ethical hacking and penetration testing',      'Lock',    0);
    insertBadge.run('b7', 'Open Source Hero',  'Rookie', 'Contributed to 3+ open source projects',       'Github',  1);
    insertBadge.run('b8', 'Sprint Champion',   'Expert', '30-day study streak without breaks',            'Zap',     1);
  }

  // Schedule
  if ((db.prepare('SELECT COUNT(*) as count FROM schedule').get() as any).count === 0) {
    const insertEvent = db.prepare('INSERT INTO schedule (id, time, title, room, type, color, dept) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertEvent.run('e1', '09:00 AM', 'Cyber Security Lab',         'Lab 402', 'Practical', '#ef4444', 'IT');
    insertEvent.run('e2', '10:00 AM', 'Cloud Computing Lecture',    'Hall A',  'Lecture',   '#3b82f6', 'CSE');
    insertEvent.run('e3', '11:30 AM', 'Database Systems',           'Hall B',  'Lecture',   '#8b5cf6', 'CSE');
    insertEvent.run('e4', '01:00 PM', 'Machine Learning Workshop',  'Lab 301', 'Practical', '#f59e0b', 'CSE');
    insertEvent.run('e5', '02:00 PM', 'Full Stack Web Dev',         'Lab 205', 'Practical', '#10b981', 'IT');
    insertEvent.run('e6', '03:00 PM', 'Computer Networks',          'Hall C',  'Lecture',   '#ec4899', 'CSE');
    insertEvent.run('e7', '04:00 PM', 'DevOps Seminar',             'Seminar Hall', 'Seminar', '#00d2ff', 'IT');
  }

  // Tutors
  if ((db.prepare('SELECT COUNT(*) as count FROM tutors').get() as any).count === 0) {
    const insertTutor = db.prepare('INSERT INTO tutors (id, user_id, expert, rating, sessions, color) VALUES (?, ?, ?, ?, ?, ?)');
    insertTutor.run('t1', 's1',  'Data Structures & Algorithms', 4.9, 42, '#8b5cf6');
    insertTutor.run('t2', 's2',  'Machine Learning / Python',    4.8, 38, '#ec4899');
    insertTutor.run('t3', 's5',  'Web Dev / React',              4.7, 25, '#3b82f6');
    insertTutor.run('t4', 's7',  'Cyber Security',               4.6, 19, '#ef4444');
    insertTutor.run('t5', 's10', 'Cloud Architecture',           4.8, 31, '#10b981');
  }

  // Tutoring Requests
  if ((db.prepare('SELECT COUNT(*) as count FROM tutoring_requests').get() as any).count === 0) {
    const insertRequest = db.prepare('INSERT INTO tutoring_requests (id, student_id, topic, status, date) VALUES (?, ?, ?, ?, ?)');
    insertRequest.run('tr1', 's3',  'React Global State Management', 'OPEN',   'Apr 07');
    insertRequest.run('tr2', 's4',  'Discrete Mathematics',          'OPEN',   'Apr 07');
    insertRequest.run('tr3', 's6',  'SQL Query Optimization',        'OPEN',   'Apr 06');
    insertRequest.run('tr4', 's8',  'Neural Networks Basics',        'OPEN',   'Apr 06');
    insertRequest.run('tr5', 's11', 'Docker & Containerization',     'MATCHED','Apr 05');
    insertRequest.run('tr6', 's13', 'Sorting Algorithms',            'MATCHED','Apr 05');
  }

  // Study Lounges
  if ((db.prepare('SELECT COUNT(*) as count FROM lounges').get() as any).count === 0) {
    const insertLounge = db.prepare('INSERT INTO lounges (id, title, host_id, members, date, time, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertLounge.run('l1', 'DSA Final Exam Sprint',       's1',  6, '2026-04-07', '22:00', 0);
    insertLounge.run('l2', 'Calculus Problem Solving',    's2',  3, '2026-04-08', '14:00', 0);
    insertLounge.run('l3', 'OS Concepts Deep Dive',       's5',  4, '2026-04-08', '20:00', 0);
    insertLounge.run('l4', 'React & Vite Lab Prep',       's3',  2, '2026-04-09', '10:00', 1);
    insertLounge.run('l5', 'ML Model Tuning Group',       's7',  5, '2026-04-09', '18:00', 0);
  }

  // User Stats (XP + Streaks for leaderboard)
  if ((db.prepare('SELECT COUNT(*) as count FROM user_stats').get() as any).count === 0) {
    const insertStats = db.prepare('INSERT OR IGNORE INTO user_stats (user_id, xp, streak) VALUES (?, ?, ?)');
    const xpData: Record<string, [number, number]> = {
      's1': [4820, 21], 's2': [4310, 18], 's3': [3980, 15], 's4': [3750, 12],
      's5': [3520, 19], 's6': [3100, 9],  's7': [2980, 7],  's8': [2760, 11],
      's9': [2540, 14], 's10': [2310, 6], 's11': [2100, 8], 's12': [1980, 5],
      's13': [1850, 3], 's14': [1620, 10],'s15': [1400, 4], 's16': [1200, 2],
      's17': [1050, 1], 's18': [850, 3],  's19': [620, 2],  's20': [400, 1],
      'fac-cse': [9200, 30], 'fac-it': [7600, 28], 'hod-cse': [11000, 45],
    };
    Object.entries(xpData).forEach(([uid, [xp, streak]]) => insertStats.run(uid, xp, streak));
  }

  // Assignments
  if ((db.prepare('SELECT COUNT(*) as count FROM assignments').get() as any).count === 0) {
    const insertAssignment = db.prepare('INSERT INTO assignments (id, title, description, instructor_id, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)');
    insertAssignment.run('a1', 'Cloud Architecture Design',    'Design a scalable 3-tier cloud architecture on AWS with auto-scaling, load balancing, and failover. Submit a report with diagrams.',                 'fac-cse', '2026-04-15', 50);
    insertAssignment.run('a2', 'SQL Query Optimization Lab',   'Optimize 10 given slow SQL queries. Explain your indexing strategy and provide before/after execution plans.',                                        'fac-cse', '2026-04-12', 30);
    insertAssignment.run('a3', 'ML Classification Report',     'Train a classification model on the provided dataset using scikit-learn. Achieve at least 85% accuracy. Document your preprocessing and evaluation.', 'fac-cse', '2026-04-20', 60);
    insertAssignment.run('a4', 'React Portfolio Project',      'Build a personal portfolio using React + TypeScript. Must include dynamic routing, API integration, and responsive design.',                           'fac-it',  '2026-04-18', 40);
    insertAssignment.run('a5', 'Network Security Audit Report','Perform a vulnerability assessment on the provided test server. Document all CVEs found, severity ratings, and suggested mitigations.',              'fac-it',  '2026-04-22', 50);
  }

  // Broadcasts
  if ((db.prepare('SELECT COUNT(*) as count FROM broadcasts').get() as any).count === 0) {
    const insertBroadcast = db.prepare('INSERT INTO broadcasts (id, title, message, author, role_target) VALUES (?, ?, ?, ?, ?)');
    insertBroadcast.run('b1', 'Rescheduled Workshop', 'The Cloud Architecture workshop by Prof. Saravanan has been moved to Monday, 10:00 AM in Lab 402.', 'Admin', 'ALL');
    insertBroadcast.run('b2', 'System Maintenance', 'Sentinel Campus nodes will undergo protocol synchronization tonight at 02:00 IST. Expect momentary latency.', 'System Admin', 'ALL');
    insertBroadcast.run('b3', 'Internship Deadline', 'Final year students are reminded to update their skill badges by Friday for the upcoming recruitment drive.', 'Dr. Arul Prasad', 'STUDENT');
    insertBroadcast.run('b4', 'New Resource Nexus', 'We have added 50+ new machine learning datasets to the Academic Vault. Access them via the Study Area.', 'IT Dept', 'ALL');
  }

  // Initial Chat Messages (Global)
  if ((db.prepare('SELECT COUNT(*) as count FROM messages').get() as any).count === 0) {
    const insertMsg = db.prepare('INSERT INTO messages (id, room_id, user_id, text, timestamp) VALUES (?, ?, ?, ?, ?)');
    const now = new Date().toISOString();
    insertMsg.run(uuidv4(), 'global', 'admin-sys', 'Welcome to the Sentinel Global Nexus. All nodes are healthy.', now);
    insertMsg.run(uuidv4(), 'global', 's1',        'Has anyone started the Cloud Design assignment?', now);
    insertMsg.run(uuidv4(), 'global', 's2',        'Yes, I just uploaded my preliminary architecture to the vault!', now);
  }

  // Chat Rooms (Moved inside seedDatabase for consistency)
  if ((db.prepare('SELECT COUNT(*) as count FROM chat_rooms').get() as any).count === 0) {
    const insertRoom = db.prepare('INSERT INTO chat_rooms (id, name, category) VALUES (?, ?, ?)');
    insertRoom.run('global', 'Global Nexus', 'CAMPUS');
    insertRoom.run('cse-general', 'CSE Faculty Forum', 'FACULTY');
    insertRoom.run('it-general', 'IT Peer Group', 'STUDENT');
  }
}

seedDatabase();

// Real-time Socket.io Logic
function broadcastEvent(type: string, payload: any) {
  io.emit('event', { type, payload });
}

// Action Logging Middleware
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    // Attempt to extract userId from headers if provided by frontend
    const userId = req.headers['x-user-id'] || 'anonymous';
    const logId = uuidv4();
    try {
      db.prepare('INSERT INTO action_logs (id, user_id, action_type, path) VALUES (?, ?, ?, ?)')
        .run(logId, userId as string, req.method, req.path);
    } catch (e) {
      console.error('Audit Log Error:', e);
    }
  }
  next();
});

// Admin Logs API
app.get('/api/admin/logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM action_logs ORDER BY timestamp DESC LIMIT 50').all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Admin Execute Arbitrary SQL API (For Database Explorer)
app.post('/api/admin/query', (req, res) => {
  try {
    const { query } = req.body;
    // Only permit SELECT statements for safety
    if (!query.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(403).json({ error: 'Only SELECT queries are allowed for security' });
    }
    const result = db.prepare(query).all();
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as any).message });
  }
});

// Admin DB Backup API
app.get('/api/admin/backup', (req, res) => {
  try {
    res.download('sentinel.db', 'sentinel_backup.db');
  } catch (err) {
    console.error('Backup failed:', err);
    res.status(500).json({ error: 'Failed to generate backup' });
  }
});

// User Stats API
app.get('/api/user/stats/:userId', (req, res) => {
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(req.params.userId);
  if (!stats) return res.status(404).json({ error: 'Stats not found' });
  res.json(stats);
});

// Study Quest Progress API
app.get('/api/study-quest/progress/:userId', (req, res) => {
  const progress = db.prepare('SELECT * FROM study_progress WHERE user_id = ?').all(req.params.userId);
  res.json(progress);
});

app.post('/api/study-quest/complete-node', (req, res) => {
  const { userId, nodeId, xp } = req.body;
  
  // 1. Update progress
  db.prepare('INSERT OR REPLACE INTO study_progress (user_id, node_id, status, xp_earned) VALUES (?, ?, ?, ?)')
    .run(userId, nodeId, 'COMPLETED', xp);
  
  // 2. Unlock next node (nodeId + 1)
  db.prepare('INSERT OR IGNORE INTO study_progress (user_id, node_id, status) VALUES (?, ?, ?)')
    .run(userId, nodeId + 1, 'ACTIVE');

  // 3. Update global XP
  db.prepare('UPDATE user_stats SET xp = xp + ?, last_active = CURRENT_TIMESTAMP WHERE user_id = ?')
    .run(xp, userId);

  // 4. Update streak if needed (simplified: increment if last_active is yesterday or today)
  // For now just increment for every completion
  db.prepare('UPDATE user_stats SET streak = streak + 1 WHERE user_id = ?').run(userId);

  res.json({ success: true, newXp: xp });
});

// Assignments API
app.get('/api/assignments', (req, res) => {
  const assignments = db.prepare('SELECT a.*, u.name as instructor_name FROM assignments a JOIN users u ON a.instructor_id = u.id').all();
  res.json(assignments);
});

app.post('/api/assignments', (req, res) => {
  const { title, description, instructorId, dueDate, maxMarks } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO assignments (id, title, description, instructor_id, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, title, description, instructorId, dueDate, maxMarks);
  res.json({ success: true, id });
});

app.get('/api/submissions/:assignmentId', (req, res) => {
  const submissions = db.prepare('SELECT s.*, u.name as student_name FROM submissions s JOIN users u ON s.student_id = u.id WHERE s.assignment_id = ?').all(req.params.assignmentId);
  res.json(submissions);
});

app.post('/api/submissions', (req, res) => {
  const { assignmentId, studentId, content } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO submissions (id, assignment_id, student_id, content) VALUES (?, ?, ?, ?)')
    .run(id, assignmentId, studentId, content);
  res.json({ success: true, id });
});
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are Sentinel AI, the intelligent academic assistant embedded in the Sentinel Campus web application. Keep your response helpful, concise, and lightly futuristic. The user says: "${message}"`;
    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text() });
  } catch (err: any) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Sentinel Neural Core offline or busy.' });
  }
});

app.post('/api/ai/grade-submission', async (req, res) => {
  const { submissionId, content, assignmentDesc, maxMarks } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      As an expert academic AI, grade the following student submission based on the assignment description.
      Assignment: "${assignmentDesc}"
      Student Submission: "${content.substring(0, 5000)}"
      Max Marks: ${maxMarks}

      Return a JSON object:
      {
        "grade": number,
        "feedback": "constructive feedback string",
        "analysis": "brief tactical analysis"
      }
    `;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PLACEHOLDER') {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const grading = JSON.parse(jsonStr);
      
      db.prepare('UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?')
        .run(grading.grade, grading.feedback, submissionId);
      
      res.json(grading);
    } else {
      // Neural Mock Grading Engine
      const scoreBase = Math.floor(Math.random() * 15) + (maxMarks * 0.8);
      const grade = Math.min(maxMarks, scoreBase);
      const topics = ["sharding architecture", "protocol efficiency", "node consensus", "latency optimization"];
      const strength = topics[Math.floor(Math.random() * topics.length)];
      
      const feedback = `Superior execution of Sentinel protocol standards. Your approach to ${strength} demonstrates high-tier strategic thinking. Optimization of the data vector nexus is recommended for Phase 5.`;
      
      db.prepare('UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?')
        .run(grade, feedback, submissionId);
        
      res.json({ 
        grade, 
        feedback, 
        analysis: `Neural analysis detected 98% compliance with ${strength} optimization protocols.` 
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'AI Grading failed' });
  }
});

// AI Note Synthesis Engine
app.post('/api/synthesis/generate', async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Analyze the following educational content and generate a structured JSON response for a "Sentinel Campus Protocol" system.
      Content: "${content.substring(0, 5000)}"
      
      The JSON must strictly follow this structure:
      {
        "summary": "High-level brief",
        "keyPoints": ["point 1", "point 2"],
        "roadmap": [{"title": "Step 1", "desc": "description", "status": "COMPLETED/ACTIVE/LOCKED"}],
        "mermaidMindMap": "mindmap\\n  root((Topic))\\n    Sub-topic",
        "formulaSheet": [{"topic": "Topic", "formula": "F = m*a", "explanation": "Brief explanation"}],
        "flashcards": [{"question": "Q", "answer": "A"}],
        "quiz": [{"question": "Q", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "E"}]
      }
    `;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PLACEHOLDER') {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonStr = text.substring(jsonStart, jsonEnd);
      res.json(JSON.parse(jsonStr));
    } else {
      // Neural Mock Synthesis Engine
      const topic = content.substring(0, 30).split(' ')[0] || 'Strategic Subject';
      const sections = ["Core Nexus", "Data Vectors", "Neural Routing", "Nexus Alignment"];
      
      res.json({
        summary: `Sentinel Neural Analysis of ${topic}: Protocol established. The subject encompasses a wide array of ${sections[0]} and ${sections[1]} theories specialized for campus-wide synchronization.`,
        keyPoints: [
          `Advanced integration of ${topic} logic into the Sentinel framework.`,
          `Establishment of ${sections[2]} nodes for accelerated knowledge transfer.`,
          `Validation of ${sections[3]} during peak academic load.`
        ],
        roadmap: [
          { title: 'Initialization', desc: `Bootstrapping ${topic} foundational arrays`, status: 'COMPLETED' },
          { title: 'Nexus Integration', desc: `Connecting core ${sections[0]} nodes`, status: 'ACTIVE' },
          { title: 'Strategic Sharding', desc: `Optimizing ${sections[2]} for V4.0`, status: 'LOCKED' }
        ],
        mermaidMindMap: `mindmap\n  root((${topic} Protocol))\n    ${sections[0]}\n      Logic Sync\n      Data Integrity\n    ${sections[1]}\n      Vector Alignment\n    ${sections[2]}`,
        formulaSheet: [
          { topic: 'Nexus Efficiency', formula: 'E = N * (log t)', explanation: 'Efficiency coefficient for node synchronization.' },
          { topic: 'Data Vector Load', formula: 'L = \u03a3(v) / t', explanation: 'Cumulative load across the routing nexus.' }
        ],
        flashcards: [
          { question: `What is the primary objective of ${topic} in Sentinel?`, answer: `Standardization of ${sections[0]} for global academic flow.` },
          { question: `Define ${sections[2]} in this context.`, answer: 'A non-linear path for rapid data packet transmission.' }
        ],
        quiz: [
          { 
            question: `Which component is critical for ${topic} synchronization?`, 
            options: sections, 
            answer: sections[0], 
            explanation: `The ${sections[0]} acts as the primary anchor for all related data vectors.` 
          }
        ]
      });
    }
  } catch (error) {
    console.error('Synthesis Error:', error);
    res.status(500).json({ error: 'AI Synthesis failed' });
  }
});

// Admin Note Synthesis Global Upload API
app.post('/api/synthesis/admin/upload', (req, res) => {
  const { userId, title, content, summary, keyPoints, flashcards, quiz } = req.body;
  if (!userId || !content) return res.status(400).json({ error: 'Missing required fields' });
  
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO notes (id, user_id, title, content, summary, key_points, flashcards, quiz, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, userId, title, content, summary, JSON.stringify(keyPoints), JSON.stringify(flashcards), JSON.stringify(quiz), 1);
    res.json({ success: true, noteId: id });
  } catch (error) {
    console.error('Error saving global note:', error);
    res.status(500).json({ error: 'Could not save public synthesis note' });
  }
});

// Broadcasts APIs
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaderboard = db.prepare(`
      SELECT u.id, u.name, s.xp, s.streak, u.role, u.department as dept
      FROM users u
      JOIN user_stats s ON u.id = s.user_id
      WHERE u.role = 'STUDENT'
      ORDER BY s.xp DESC
      LIMIT 100
    `).all();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Admin User Management CRUD
app.get('/api/broadcasts', (req, res) => {
  res.json(db.prepare('SELECT * FROM broadcasts ORDER BY timestamp DESC').all());
});
app.post('/api/broadcasts', (req, res) => {
  const { title, message, author, roleTarget } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO broadcasts (id, title, message, author, role_target) VALUES (?, ?, ?, ?, ?)').run(id, title, message, author, roleTarget);
  res.json({ success: true, broadcastId: id });
});

// Chat API
app.get('/api/chat/:roomId', (req, res) => {
  const messages = db.prepare(`
    SELECT m.id, m.room_id as roomId, m.user_id as userId, m.text, m.timestamp, m.status, u.name, u.role
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ?
    ORDER BY m.timestamp ASC
  `).all(req.params.roomId);
  
  res.json(messages.map((m: any) => ({
    ...m,
    timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })));
});

// Tasks (TaskBreaker) APIs
app.get('/api/tasks/:userId', (req, res) => {
  res.json(db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.params.userId));
});
app.post('/api/tasks', (req, res) => {
  const { userId, title } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO tasks (id, user_id, title) VALUES (?, ?, ?)').run(id, userId, title);
  res.json({ success: true, taskId: id });
});
app.put('/api/tasks/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// Books (BookSwap) APIs
app.get('/api/books', (req, res) => {
  res.json(db.prepare('SELECT b.*, u.name as owner_name FROM books b JOIN users u ON b.owner_id = u.id').all());
});
app.post('/api/books', (req, res) => {
  const { title, author, condition, price, color, ownerId } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO books (id, title, author, condition, price, color, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, title, author, condition, price, color, ownerId);
  res.json({ success: true, bookId: id });
});
app.put('/api/books/:id', (req, res) => {
  const { status, requestorId } = req.body;
  db.prepare('UPDATE books SET status = ?, requestor_id = ? WHERE id = ?').run(status, requestorId, req.params.id);
  res.json({ success: true });
});

// Sentiment Logs APIs
app.get('/api/lounges', (req, res) => {
  const lounges = db.prepare(`
    SELECT l.*, u.name as host 
    FROM lounges l 
    JOIN users u ON l.host_id = u.id 
    ORDER BY l.date DESC, l.time DESC
  `).all() as any[];
  // map to expected format, adding tags and live status mock
  res.json(lounges.map(l => ({
    ...l,
    tags: l.title.includes('Data') ? 'DSA, Arrays' : 'Math, Calculus',
    live: l.title.includes('Sprint') // simple mock logic
  })));
});

app.post('/api/lounges', (req, res) => {
  const { title, hostId, date, time, isPrivate } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO lounges (id, title, host_id, members, date, time, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, title, hostId, 1, date, time, isPrivate ? 1 : 0);
  res.json({ success: true, loungeId: id });
});


app.get('/api/sentiment', (req, res) => {
  res.json({
    positive: Math.floor(Math.random() * 20) + 65,
    neutral: Math.floor(Math.random() * 10) + 10,
    critical: Math.floor(Math.random() * 10) + 5,
    responses: Math.floor(Math.random() * 500) + 1200,
    topics: [
      { topic: 'S7 Timetable Clash', sentiment: 'Critical', text: 'Network & Security lab overlaps with core DB.', time: '1h ago' },
      { topic: 'Library Environment', sentiment: 'Positive', text: 'The new quiet zones are perfect for deep work.', time: '4h ago' }
    ]
  });
});

app.get('/api/sentiment/:userId', (req, res) => {
  res.json(db.prepare('SELECT * FROM sentiment_logs WHERE user_id = ? ORDER BY timestamp DESC').all(req.params.userId));
});
app.post('/api/sentiment', (req, res) => {
  const { userId, mood, notes } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO sentiment_logs (id, user_id, mood, notes) VALUES (?, ?, ?, ?)').run(id, userId, mood, notes);
  res.json({ success: true, logId: id });
});

// Schedule API Expansion
app.post('/api/schedule', (req, res) => {
  const { time, title, room, type, color, dept } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO schedule (id, time, title, room, type, color, dept) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, time, title, room, type, color, dept);
  res.json({ success: true, eventId: id });
});

// Tutoring Requests Extension
app.get('/api/tutoring/tutors', (req, res) => res.json(db.prepare('SELECT * FROM tutors').all()));
app.get('/api/tutoring/requests', (req, res) => {
  res.json(db.prepare(`
    SELECT r.*, u.name as student_name, u.department as dept 
    FROM tutoring_requests r JOIN users u ON r.student_id = u.id 
    ORDER BY r.date DESC
  `).all());
});
app.post('/api/tutoring', (req, res) => {
  const { studentId, topic } = req.body;
  const id = uuidv4();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  db.prepare('INSERT INTO tutoring_requests (id, student_id, topic, status, date) VALUES (?, ?, ?, ?, ?)').run(id, studentId, topic, 'OPEN', dateStr);
  res.json({ success: true, requestId: id });
});
app.put('/api/tutoring/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE tutoring_requests SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// College/Student Reports Export Simulator
app.get('/api/reports/export', (req, res) => {
  const { type, department } = req.query;
  let csv = "ID,Name,Status\\n";
  if (type === 'faculty' && department) {
    const users = db.prepare("SELECT username, name FROM users WHERE department = ? AND role = 'FACULTY'").all(department) as any[];
    users.forEach(u => csv += `${u.username},${u.name},Active\\n`);
  } else if (type === 'students' && department) {
    const users = db.prepare("SELECT username, name FROM users WHERE department = ? AND role = 'STUDENT'").all(department) as any[];
    users.forEach(u => csv += `${u.username},${u.name},Enrolled\\n`);
  } else {
    csv = "System Export Data\\nValue1,Value2\\nStatus,Complete";
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="report_${type || 'export'}.csv"`);
  res.send(csv);
});

// Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      department: user.department 
    }, JWT_SECRET, { expiresIn: '24h' });
    
    // Don't send password back
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Students/Faculty for Department (HOD View)
app.get('/api/hod/users', (req, res) => {
  const { department } = req.query;
  const users = db.prepare('SELECT id, name, role, department, username FROM users WHERE department = ?').all(department);
  res.json(users);
});

// Admin View All Users
app.get('/api/admin/users', authenticateToken, (req, res) => {
  const users = db.prepare('SELECT id, name, role, department, username, email FROM users').all();
  res.json(users);
});

// Create/Update User
app.post('/api/users', (req, res) => {
  const { id, username, password, role, name, department, email } = req.body;
  const userId = id || uuidv4();
  const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;
  
  if (hashedPassword) {
    db.prepare('INSERT OR REPLACE INTO users (id, username, password, role, name, department, email) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(userId, username, hashedPassword, role, name, department, email || '');
  } else {
    db.prepare('UPDATE users SET username = ?, role = ?, name = ?, department = ?, email = ? WHERE id = ?')
      .run(username, role, name, department, email || '', userId);
  }
  res.json({ success: true, id: userId });
});

// Delete User
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Student Insights API
app.get('/api/student/:id/insights', (req, res) => {
  const userId = req.params.id;
  
  // Attendance Score
  // Adjusting attendance query for new schema
  const attTotal = (db.prepare('SELECT COUNT(*) as c FROM attendance WHERE user_id = ?').get(userId) as any).c;
  const attPresent = (db.prepare('SELECT COUNT(*) as c FROM attendance WHERE user_id = ? AND status = ?').get(userId, 'PRESENT') as any).c;
  const attendanceScore = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;

  // Projects Completion
  const projTotal = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE student_id = ?').get(userId) as any).c;
  const projDone = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE student_id = ? AND status = ?').get(userId, 'GRADED') as any).c;
  const overallCompletion = projTotal > 0 ? Math.round((projDone / projTotal) * 100) : 0;

  // Pending lessons/projects (status not graded)
  const pendingProjects = (db.prepare("SELECT * FROM projects WHERE student_id = ? AND status != 'GRADED' ORDER BY submission_date ASC LIMIT 3").all(userId) as any[]);
  const pendingCount = projTotal - projDone;

  res.json({
    attendanceScore,
    overallCompletion,
    skillsMastery: Math.min(100, (projDone * 15) + (attPresent * 2) + 10), // Mocked metric
    pendingCount,
    upcomingDeadlines: pendingProjects
  });
});

// AI Study Recommendations API
app.get('/api/student/:id/recommendations', (req, res) => {
  const userId = req.params.id;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Rule-based generic recommendations customized by department
  const dept = user.department || 'CSE';
  const recs = [
    { title: `Core Methods in ${dept}`, type: 'PDF', icon: 'FileText', reason: 'Based on your recent missed attendance' },
    { title: `Advanced Concepts in ${dept}`, type: 'Video', icon: 'Video', reason: 'To improve your overall completion score' },
    { title: 'Time Management for Engineers', type: 'Workshop', icon: 'Sparkles', reason: 'Recommended AI soft-skill' },
  ];
  res.json(recs);
});

// HOD Department Analytics API
app.get('/api/hod/analytics', (req, res) => {
  const dept = req.query.dept;
  if (!dept) return res.status(400).json({ error: 'Department required' });

  const students = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT' AND department = ?").get(dept) as any;
  const faculty = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'FACULTY' AND department = ?").get(dept) as any;
  const courses = db.prepare("SELECT COUNT(*) as count FROM courses WHERE dept = ?").get(dept) as any;
  
  // Adjusting attendance query for new schema
  const attendanceRecords = db.prepare(`
    SELECT a.status 
    FROM attendance a 
    JOIN attendance_sessions s ON a.session_id = s.id
    WHERE s.department = ?
  `).all(dept) as any[];

  const totalAtt = attendanceRecords.length;
  const presentAtt = attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const avgAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

  const projects = db.prepare(`
    SELECT p.status 
    FROM projects p
    WHERE p.department = ?
  `).all(dept) as any[];

  const totalProj = projects.length;
  const completedProj = projects.filter(p => p.status === 'GRADED' || p.status === 'APPROVED').length;
  const projCompletion = totalProj > 0 ? Math.round((completedProj / totalProj) * 100) : 0;

  res.json({
    students: students.count,
    faculty: faculty.count,
    courses: courses.count,
    avgAttendance,
    projCompletion
  });
});

// HOD Faculty Workload API
app.get('/api/hod/faculty-workload', (req, res) => {
  const dept = req.query.dept;
  if (!dept) return res.status(400).json({ error: 'Department required' });

  const facultyList = db.prepare("SELECT id, name FROM users WHERE role = 'FACULTY' AND department = ?").all(dept) as any[];
  
  const workload = facultyList.map(f => {
    const courseCount = (db.prepare("SELECT COUNT(*) as count FROM courses WHERE faculty_id = ?").get(f.id) as any).count;
    const loadPercent = Math.min(100, Math.round((courseCount / 4) * 100));
    return {
      id: f.id,
      name: f.name,
      courses: courseCount,
      loadPercent,
      status: loadPercent >= 100 ? 'OVERLOADED' : loadPercent >= 75 ? 'OPTIMAL' : 'AVAILABLE'
    };
  });

  res.json(workload);
});

// Student Export API
app.get('/api/student/:id/export', (req, res) => {
  const userId = req.params.id;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Adjusting attendance query for new schema
  const attendance = db.prepare('SELECT a.timestamp, s.course_id, a.status FROM attendance a JOIN attendance_sessions s ON a.session_id = s.id WHERE a.user_id = ? ORDER BY a.timestamp DESC').all(userId) as any[];
  const projects = db.prepare('SELECT * FROM projects WHERE student_id = ? ORDER BY submission_date DESC').all(userId) as any[];
  
  // Create a simple CSV format string
  let csv = `Academic History for ${user.name} (${user.department})\n\n`;
  csv += `=== ATTENDANCE ===\nDate,Course ID,Status\n`;
  attendance.forEach(a => csv += `${new Date(a.timestamp).toLocaleDateString()},${a.course_id},${a.status}\n`);
  csv += `\n=== PROJECTS ===\nTitle,Submission Date,Status\n`;
  projects.forEach(p => csv += `${p.title},${p.submission_date},${p.status}\n`);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="academic-history-${userId}.csv"`);
  res.send(csv);
});

// Courses API
app.get('/api/courses', (req, res) => {
  const { dept, facultyId } = req.query;
  let query;
  if (facultyId) {
    query = db.prepare('SELECT * FROM courses WHERE faculty_id = ?');
    res.json(query.all(facultyId));
  } else if (dept) {
    query = db.prepare('SELECT * FROM courses WHERE dept = ?');
    res.json(query.all(dept));
  } else {
    query = db.prepare('SELECT * FROM courses');
    res.json(query.all());
  }
});

// Course Analytics API (Faculty)
app.get('/api/courses/:id/analytics', (req, res) => {
  const courseId = req.params.id;
  // Get all students
  const students = db.prepare("SELECT id, name, department FROM users WHERE role = 'STUDENT'").all() as any[];
  
  // Get all attendance for this course (adjusted for new schema)
  const attendance = db.prepare('SELECT a.user_id, a.status FROM attendance a JOIN attendance_sessions s ON a.session_id = s.id WHERE s.course_id = ?').all(courseId) as any[];
  
  // Calculate stats per student
  const rosterStats = students.map(st => {
    const studentAtt = attendance.filter(a => a.user_id === st.id);
    const totalSessions = studentAtt.length;
    let presentCount = studentAtt.filter(a => a.status === 'PRESENT').length;
    // Mocking an attendance score logic: if no sessions yet, 100%
    const score = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;
    
    return {
      id: st.id,
      name: st.name,
      department: st.department,
      attendanceScore: score,
      needsAlert: score < 75 // Smart alert criteria
    };
  });
  
  const classAverage = rosterStats.length > 0 ? 
    Math.round(rosterStats.reduce((sum, s) => sum + s.attendanceScore, 0) / rosterStats.length) : 0;
    
  // Find low performers for smart alerts
  const lowPerformers = rosterStats.filter(s => s.needsAlert);
  
  res.json({
    courseId,
    classAverage,
    totalStudents: students.length,
    rosterStats,
    lowPerformers
  });
});

// Badges API
app.get('/api/badges', (req, res) => {
  res.json(db.prepare('SELECT * FROM badges').all());
});

// Schedule API
app.get('/api/schedule', (req, res) => {
  const { dept } = req.query;
  const query = dept 
    ? db.prepare('SELECT * FROM schedule WHERE dept = ?')
    : db.prepare('SELECT * FROM schedule');
  res.json(dept ? query.all(dept) : query.all());
});

// Leaderboard API
app.get('/api/leaderboard', (req, res) => {
  const { department } = req.query;
  const users = department 
    ? db.prepare('SELECT id, name, department, role FROM users WHERE department = ? AND role = "STUDENT"').all(department)
    : db.prepare('SELECT id, name, department, role FROM users WHERE role = "STUDENT"').all();
  
  const leaderboard = (users as any[]).map(u => {
    const projectCount = (db.prepare('SELECT COUNT(*) as count FROM projects WHERE student_id = ?').get(u.id) as any).count;
    const attendanceCount = (db.prepare('SELECT COUNT(*) as count FROM attendance WHERE user_id = ?').get(u.id) as any).c; // Adjusted for new schema
    const xp = (projectCount * 500) + (attendanceCount * 100) + 1000; // Base XP
    return { ...u, xp, trend: Math.random() > 0.5 ? 'up' : 'down' };
  }).sort((a, b) => b.xp - a.xp);
  
  res.json(leaderboard);
});

// Sentiment API
app.get('/api/sentiment', (req, res) => {
  const { department } = req.query;
  // Mock sentiment data based on department
  const basePos = department === 'CSE' ? 85 : 78;
  res.json({
    positive: basePos + Math.floor(Math.random() * 5),
    neutral: 10 + Math.floor(Math.random() * 5),
    critical: 5,
    responses: 1000 + Math.floor(Math.random() * 500),
    topics: [
      { topic: 'Curriculum Pace', sentiment: 'Positive', time: '2h ago', text: 'The course pace is well-balanced.' },
      { topic: 'Lab Accessibility', sentiment: 'Critical', time: '5h ago', text: 'More lab hours needed on weekends.' },
      { topic: 'Peer Collaboration', sentiment: 'Positive', time: '1d ago', text: 'Great team projects this semester.' }
    ]
  });
});

// Tutoring API
app.get('/api/tutoring/tutors', (req, res) => {
  const tutors = db.prepare('SELECT t.*, u.name FROM tutors t JOIN users u ON t.user_id = u.id').all();
  res.json(tutors);
});

app.get('/api/tutoring/requests', (req, res) => {
  const requests = db.prepare('SELECT tr.*, u.name as student_name FROM tutoring_requests tr JOIN users u ON tr.student_id = u.id').all();
  res.json(requests);
});

// Lounges API
app.get('/api/lounges', (req, res) => {
  const lounges = db.prepare('SELECT l.*, u.name as host_name FROM lounges l JOIN users u ON l.host_id = u.id').all();
  res.json(lounges);
});

// Attendance Management (Legacy endpoint, might need review after schema change)
app.post('/api/attendance', (req, res) => {
  const { userId, courseId, status, department } = req.body;
  const id = uuidv4();
  // This endpoint is now deprecated or needs to be re-evaluated given the new attendance schema
  // For now, it's kept but won't work as expected without a session_id
  res.status(501).json({ error: 'This attendance endpoint is deprecated. Use /api/attendance/mark instead.' });
});

app.get('/api/attendance/report', (req, res) => {
  const { department } = req.query;
  // Adjusted for new schema: join with attendance_sessions to get course_id and department
  let query;
  if (department) {
    query = db.prepare('SELECT a.id, a.user_id, a.status, a.timestamp, s.course_id, s.department FROM attendance a JOIN attendance_sessions s ON a.session_id = s.id WHERE s.department = ?');
    res.json(query.all(department));
  } else {
    query = db.prepare('SELECT a.id, a.user_id, a.status, a.timestamp, s.course_id, s.department FROM attendance a JOIN attendance_sessions s ON a.session_id = s.id');
    res.json(query.all());
  }
});

// ========== QR ATTENDANCE SESSION SYSTEM ==========

// Start a new attendance session
app.post('/api/attendance/session/start', (req, res) => {
  const { courseId, facultyId, department, latitude, longitude } = req.body;
  // Close any existing active session for this course
  db.prepare("UPDATE attendance_sessions SET status = 'CLOSED' WHERE course_id = ? AND status = 'ACTIVE'").run(courseId);
  const id = uuidv4();
  const token = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  db.prepare('INSERT INTO attendance_sessions (id, course_id, faculty_id, token, department, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, courseId, facultyId, token, department, latitude || null, longitude || null);
  // Broadcast session started
  broadcastEvent('SESSION_STARTED', { sessionId: id, courseId, token });
  res.json({ success: true, sessionId: id, token });
});

// Regenerate token for active session
app.post('/api/attendance/session/refresh', (req, res) => {
  const { sessionId } = req.body;
  const newToken = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  db.prepare('UPDATE attendance_sessions SET token = ? WHERE id = ? AND status = ?').run(newToken, sessionId, 'ACTIVE');
  // Broadcast token refresh
  broadcastEvent('TOKEN_REFRESHED', { sessionId, token: newToken });
  res.json({ success: true, token: newToken });
});

// Stop a session
app.post('/api/attendance/session/stop', (req, res) => {
  const { sessionId } = req.body;
  
  // 1. Mark session CLOSED
  db.prepare("UPDATE attendance_sessions SET status = 'CLOSED' WHERE id = ?").run(sessionId);
  
  // 2. Identify and Notify Absentees
  const session = db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').get(sessionId) as any;
  if (session) {
    // Find all students in this department/section who did NOT scan
    const absentees = db.prepare(`
      SELECT id, name, parent_phone 
      FROM users 
      WHERE role = 'STUDENT' 
      AND department = ? 
      AND id NOT IN (SELECT user_id FROM attendance WHERE session_id = ?)
    `).all(session.department, sessionId) as any[];

    absentees.forEach(s => {
      triggerAbsenceNotification(s.id, sessionId, 'AUTOMATIC_QR_TIMEOUT');
    });
  }

  // 3. Broadcast final attendees
  const attendees = db.prepare(
    "SELECT a.user_id, u.name FROM attendance a JOIN users u ON a.user_id = u.id WHERE a.session_id = ?"
  ).all(sessionId) as any[];
  
  broadcastEvent('SESSION_STOPPED', { sessionId, attendees });
  res.json({ success: true, attendeeCount: attendees.length });
});

// Helper for AI Notification Simulation
function triggerAbsenceNotification(studentId: string, sessionId: string, reason: string) {
  const student = db.prepare('SELECT * FROM users WHERE id = ?').get(studentId) as any;
  const session = db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').get(sessionId) as any;
  const course = session ? db.prepare('SELECT name FROM courses WHERE id = ?').get(session.course_id) as any : { name: 'Faculty Session' };

  if (!student) return;

  const timestamp = new Date().toISOString();
  const magenta = "\x1b[35m", cyan = "\x1b[36m", yellow = "\x1b[33m", reset = "\x1b[0m";
  
  console.log(`${magenta}[TELECOM-SENTINEL]${reset} ${cyan}${timestamp}${reset} | Initiating AI Call to: ${yellow}${student.parent_phone}${reset} (Parent of ${student.name})`);
  console.log(`${magenta}[TELECOM-SENTINEL]${reset} AI Voice Script: "Hello, this is Sentinel Campus AI. Your ward ${student.name} was absent for ${course.name}. Please ensure attendance compliance."`);
  console.log(`${magenta}[TELECOM-SENTINEL]${reset} SMS Transmitted: "Alert: ${student.name} missed attendance in ${course.name}. - Sentinel Protocol"`);

  // Broadcast to frontend for demo voice/toast
  broadcastEvent('ABSENCE_NOTIFICATION', {
    studentName: student.name,
    courseName: course.name,
    parentPhone: student.parent_phone,
    reason
  });
}

// Manual Marking - Status Override
app.post('/api/attendance/mark-status', (req, res) => {
  const { sessionId, studentId, status, odLetterUrl } = req.body;
  const id = uuidv4();
  try {
     db.prepare("INSERT OR REPLACE INTO attendance (id, session_id, user_id, status, od_letter_url) VALUES (?, ?, ?, ?, ?)").run(id, sessionId, studentId, status, odLetterUrl || null);
     
     if (status === 'ABSENT') {
        triggerAbsenceNotification(studentId, sessionId, 'MANUAL_FACULTY_MARK');
     }
     
     res.json({ success: true });
  } catch (e) {
     res.status(500).json({ error: 'Failed to update attendance status' });
  }
});

// Student OD Submission
app.post('/api/attendance/od-submit', (req, res) => {
  const { sessionId, userId, odLetterUrl, latitude, longitude } = req.body;
  if (!sessionId || !userId || !odLetterUrl) return res.status(400).json({ error: 'Missing OD details' });
  
  const id = uuidv4();
  try {
    db.prepare(`
      INSERT OR REPLACE INTO attendance (id, session_id, user_id, status, od_letter_url, latitude, longitude) 
      VALUES (?, ?, ?, 'OD_PENDING', ?, ?, ?)
    `).run(id, sessionId, userId, odLetterUrl, latitude || null, longitude || null);
    
    res.json({ success: true, message: 'OD Request submitted for review.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit OD request.' });
  }
});

// Manual Attendance Entry by Faculty
app.post('/api/attendance/manual', (req, res) => {
  const { sessionId, studentId, status, odLetterUrl } = req.body;
  const targetStatus = status || 'PRESENT_MANUAL';
  
  if (!sessionId || !studentId) return res.status(400).json({ error: 'sessionId and studentId required' });
  const id = uuidv4();
  try {
    db.prepare("INSERT OR REPLACE INTO attendance (id, session_id, user_id, status, od_letter_url) VALUES (?, ?, ?, ?, ?)").run(id, sessionId, studentId, targetStatus, odLetterUrl || null);
    const student = db.prepare("SELECT name FROM users WHERE id = ?").get(studentId) as any;
    broadcastEvent('ATTENDANCE_MARKED', { sessionId, studentId, studentName: student?.name || studentId, timestamp: new Date().toISOString(), manual: true, status: targetStatus });
    res.json({ success: true, studentName: student?.name });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to record manual attendance.' });
  }
});

// Session Feedback (emoji + comment from students after session ends)
app.post('/api/attendance/session/feedback', (req, res) => {
  const { sessionId, studentId, emoji, comment } = req.body;
  const id = uuidv4();
  try {
    db.prepare("INSERT OR REPLACE INTO session_feedback (id, session_id, student_id, emoji, comment) VALUES (?, ?, ?, ?, ?)").run(id, sessionId, studentId, emoji, comment || '');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record feedback.' });
  }
});

// Get Feedback for a Session (Faculty View)
app.get('/api/attendance/session/:sessionId/feedback', (req, res) => {
  const rows = db.prepare(`
    SELECT sf.emoji, sf.comment, sf.timestamp, u.name as student_name
    FROM session_feedback sf
    LEFT JOIN users u ON sf.student_id = u.id
    WHERE sf.session_id = ?
    ORDER BY sf.timestamp DESC
  `).all(req.params.sessionId);
  res.json(rows);
});

// Get active sessions
app.get('/api/attendance/session/active', (req, res) => {
  const { facultyId } = req.query;
  const sessions = facultyId
    ? db.prepare("SELECT s.*, c.name as course_name FROM attendance_sessions s JOIN courses c ON s.course_id = c.id WHERE s.faculty_id = ? AND s.status = 'ACTIVE'").all(facultyId)
    : db.prepare("SELECT s.*, c.name as course_name FROM attendance_sessions s JOIN courses c ON s.course_id = c.id WHERE s.status = 'ACTIVE'").all();
  res.json(sessions);
});

// Student marks attendance via token
app.post('/api/attendance/mark', (req, res) => {
  const { token, userId, latitude, longitude } = req.body;
  // Find active session with this token
  const session = db.prepare("SELECT * FROM attendance_sessions WHERE token = ? AND status = 'ACTIVE'").get(token) as any;
  if (!session) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  // Geo-location Check (Allow if either doesn't have coordinates to be forgiving in fallback mode,
  // but if both exist, verify distance is <= 150m)
  if (session.latitude && session.longitude && latitude && longitude) {
    const distance = getDistanceInMeters(session.latitude, session.longitude, latitude, longitude);
    
    // Proximity check (e.g. 500m)
    if (distance === null || distance > 500) {
      return res.status(403).json({ error: `You are too far from the session location (${distance ? Math.round(distance) : 'Unknown'}m)` });
    }
  }
  // The else if block blocking missing locations has been removed to allow fallback testing

  // Check for duplicate
  const existing = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND session_id = ?')
    .get(userId, session.id) as any;
  if (existing) {
    return res.status(409).json({ error: 'You have already marked attendance for this session' });
  }
  // Get student name
  const student = db.prepare('SELECT name, department FROM users WHERE id = ?').get(userId) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  // Insert attendance record (using session.id as the session_id field)
  const id = uuidv4();
  db.prepare('INSERT INTO attendance (id, user_id, session_id, status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, userId, session.id, 'PRESENT', latitude || null, longitude || null);
  // Broadcast to all connected clients
  const broadcastData = {
    type: 'ATTENDANCE_MARKED',
    sessionId: session.id,
    courseId: session.course_id,
    studentId: userId,
    studentName: student.name,
    department: student.department,
    timestamp: new Date().toISOString()
  };
  broadcastEvent('ATTENDANCE_MARKED', broadcastData);
  res.json({ success: true, courseName: session.course_id, studentName: student.name });
});

// 4. GET Session Records (Now with Geo & OD Letter)
app.get('/api/attendance/session/:sessionId/records', (req, res) => {
  const { sessionId } = req.params;
  try {
     const records = db.prepare(`
       SELECT a.*, u.name as student_name, u.department 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.session_id = ?
     `).all(sessionId);
     res.json(records);
  } catch (e) {
     res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Get ALL students enrolled in a course (Roster)
app.get('/api/courses/:courseId/students', (req, res) => {
  const course = db.prepare('SELECT dept FROM courses WHERE id = ?').get(req.params.courseId) as any;
  if (!course) return res.status(404).json({ error: 'Course not found' });
  
  // For this demo, we assume students are enrolled by department
  const students = db.prepare('SELECT id, name, department, role FROM users WHERE role = "STUDENT" AND department = ?').all(course.dept);
  res.json(students);
});

// Projects API
app.get('/api/projects', (req, res) => {
  const { studentId, department } = req.query;
  let query;
  if (studentId) {
    query = db.prepare('SELECT * FROM projects WHERE student_id = ?');
    res.json(query.all(studentId));
  } else if (department) {
    query = db.prepare('SELECT * FROM projects WHERE department = ?');
    res.json(query.all(department));
  } else {
    query = db.prepare('SELECT * FROM projects');
    res.json(query.all());
  }
});

app.post('/api/projects', (req, res) => {
  const { id, title, description, studentId, department, status, proposal, code } = req.body;
  const projectId = id || uuidv4();
  db.prepare('INSERT OR REPLACE INTO projects (id, title, description, student_id, department, status, proposal, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(projectId, title, description, studentId, department, status || 'PROPOSAL', proposal || '', code || '');
  res.json({ success: true, id: projectId });
});

// Saved Notes API
app.get('/api/notes', (req, res) => {
  const { userId } = req.query;
  const noteList = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  res.json((noteList as any[]).map(note => ({
    ...note,
    keyPoints: JSON.parse(note.key_points),
    roadmap: JSON.parse(note.roadmap || '[]'),
    mermaidMindMap: note.mermaid_mid_map || '',
    formulaSheet: JSON.parse(note.formula_sheet || '[]'),
    flashcards: JSON.parse(note.flashcards),
    quiz: JSON.parse(note.quiz)
  })));
});

app.post('/api/notes', (req, res) => {
  const { userId, title, content, summary, keyPoints, roadmap, mermaidMindMap, formulaSheet, flashcards, quiz } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO notes (id, user_id, title, content, summary, key_points, roadmap, mermaid_mind_map, formula_sheet, flashcards, quiz) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, title, content, summary, JSON.stringify(keyPoints), JSON.stringify(roadmap), mermaidMindMap, JSON.stringify(formulaSheet), JSON.stringify(flashcards), JSON.stringify(quiz));
  res.json({ success: true, id });
});

// AI Note Summarization
app.post('/api/notes/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided.' });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert academic assistant. Summarize the following note content into a clear, structured summary with key points, main topics, and important definitions. Format your response as JSON with: { "summary": "...", "keyPoints": ["...", "..."], "importantTerms": [{"term": "...", "definition": "..."}] }\n\nContent:\n${text.substring(0, 8000)}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    res.json(JSON.parse(raw));
  } catch (e: any) {
    console.error('Note summarize error:', e);
    res.status(500).json({ error: 'AI summarization failed.' });
  }
});

// AI Quiz Generation from Notes
app.post('/api/notes/quiz', async (req, res) => {
  try {
    const { text, count = 5 } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided.' });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an academic quiz generator. Based on the following content, generate exactly ${count} multiple-choice questions. Return ONLY a valid JSON array in the format: [{"question":"...","options":["A","B","C","D"],"correctIndex":0}]. The correctIndex is 0-based.\n\nContent:\n${text.substring(0, 8000)}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    const questions = JSON.parse(raw);
    res.json({ questions });
  } catch (e: any) {
    console.error('Quiz generation error:', e);
    res.status(500).json({ error: 'AI quiz generation failed.' });
  }
});

// Socket.io Connection Logic
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  socket.on('JOIN_ROOM', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('USER_ONLINE', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('USER_STATUS_CHANGE', { userId, status: 'ONLINE' });
  });

  socket.on('SEND_MESSAGE', (data) => {
    const { userId, roomId, text, userName, userRole } = data;
    const msgId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Persist to DB
    db.prepare('INSERT INTO messages (id, room_id, user_id, text, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(msgId, roomId, userId, text, timestamp);
    
    // Broadcast to room
    io.to(roomId).emit('NEW_MESSAGE', {
      id: msgId,
      roomId,
      userId,
      name: userName,
      role: userRole,
      text,
      timestamp: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SENT'
    });
  });

  socket.on('MARK_READ', ({ messageId, roomId }) => {
    db.prepare("UPDATE messages SET status = 'READ' WHERE id = ?").run(messageId);
    io.to(roomId).emit('MESSAGE_READ', { messageId });
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = '';
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = uid;
        onlineUsers.delete(uid);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('USER_STATUS_CHANGE', { userId: disconnectedUserId, status: 'OFFLINE' });
    }
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = 3001;
// Bulk Update Projects API
app.post('/api/projects/bulk-update', (req, res) => {
  const { updates } = req.body;
  if (!updates || !Array.isArray(updates)) return res.status(400).json({ error: 'Invalid updates payload' });

  const stmt = db.prepare('UPDATE projects SET status = ?, grade = ? WHERE id = ?');
  const transaction = db.transaction((updatesBatch) => {
    for (const item of updatesBatch) {
      // For CSV processing, map grade explicitly
      stmt.run(item.status || 'GRADED', item.grade || 0, item.id);
    }
  });

  try {
    transaction(updates);
    res.json({ success: true, count: updates.length });
  } catch (err) {
    console.error('Bulk update failed:', err);
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

// Serve frontend natively for public deployments
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
