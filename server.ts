import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

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
    email TEXT
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
`);

// Dynamic altering for new geo-location columns
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN latitude REAL"); } catch(e) {}
try { db.exec("ALTER TABLE attendance_sessions ADD COLUMN longitude REAL"); } catch(e) {}
try { db.exec("ALTER TABLE attendance ADD COLUMN latitude REAL"); } catch(e) {}
try { db.exec("ALTER TABLE attendance ADD COLUMN longitude REAL"); } catch(e) {}

// Helper for Haversine distance
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
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
  // Seed Users
  const seedUser = db.prepare('INSERT OR REPLACE INTO users (id, username, password, role, name, department) VALUES (?, ?, ?, ?, ?, ?)');
  seedUser.run('admin-sys', 'admin1', 'password', 'ADMIN', 'System Administrator', 'IT');
  seedUser.run('hod-cse', 'hod_cse', 'password', 'HOD', 'Dr. Arul Prasad', 'CSE');
  seedUser.run('fac-cse', 'fac_cse_1', 'password', 'FACULTY', 'Prof. Saravanan', 'CSE');
  for (let i = 1; i <= 10; i++) {
    seedUser.run(`s${i}`, `student${i}`, 'password', 'STUDENT', `Student ${i}`, i <= 5 ? 'CSE' : 'IT');
  }

  // Seed Courses
  if ((db.prepare('SELECT COUNT(*) as count FROM courses').get() as any).count === 0) {
    const insertCourse = db.prepare('INSERT INTO courses (id, name, dept, time, faculty_id) VALUES (?, ?, ?, ?, ?)');
    insertCourse.run('CS301', 'Cloud Computing', 'CSE', '10:00 AM', 'fac-cse');
    insertCourse.run('CS302', 'Database Systems', 'CSE', '11:30 AM', 'fac-cse');
    insertCourse.run('IT201', 'Web Dev', 'IT', '02:00 PM', 'fac-cse');
    insertCourse.run('ME401', 'Robotics', 'ME', '09:00 AM', 'fac-cse');
  }

  // Seed Badges
  if ((db.prepare('SELECT COUNT(*) as count FROM badges').get() as any).count === 0) {
    const insertBadge = db.prepare('INSERT INTO badges (id, title, level, description, icon, earned) VALUES (?, ?, ?, ?, ?, ?)');
    insertBadge.run('b1', 'Cloud Pioneer', 'Pro', 'Mastered AWS/Azure deployments', 'Cloud', 1);
    insertBadge.run('b2', 'Code Architect', 'Expert', 'Excellence in system design', 'Code', 1);
    insertBadge.run('b3', 'Bug Hunter', 'Elite', 'Identified 50+ critical vulnerabilities', 'Shield', 0);
    insertBadge.run('b4', 'AI Virtuoso', 'Pro', 'Implemented self-learning neural nets', 'Brain', 0);
  }

  // Seed Schedule
  if ((db.prepare('SELECT COUNT(*) as count FROM schedule').get() as any).count === 0) {
    const insertEvent = db.prepare('INSERT INTO schedule (id, time, title, room, type, color, dept) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertEvent.run('e1', '09:00 AM', 'System Security Lab', 'Lab 402', 'Practical', '#ef4444', 'CSE');
    insertEvent.run('e2', '11:30 AM', 'Advanced Algorithms', 'Hall A', 'Lecture', '#8b5cf6', 'CSE');
    insertEvent.run('e3', '02:00 PM', 'IoT Workshop', 'Incubation Ctr', 'Seminar', '#f59e0b', 'IT');
  }

  // Seed Tutors
  if ((db.prepare('SELECT COUNT(*) as count FROM tutors').get() as any).count === 0) {
    const insertTutor = db.prepare('INSERT INTO tutors (id, user_id, expert, rating, sessions, color) VALUES (?, ?, ?, ?, ?, ?)');
    insertTutor.run('t1', 's1', 'Data Structures', 4.9, 42, '#8b5cf6');
    insertTutor.run('t2', 's2', 'Operating Systems', 4.8, 38, '#ec4899');
  }

  // Seed Tutoring Requests
  if ((db.prepare('SELECT COUNT(*) as count FROM tutoring_requests').get() as any).count === 0) {
    const insertRequest = db.prepare('INSERT INTO tutoring_requests (id, student_id, topic, status, date) VALUES (?, ?, ?, ?, ?)');
    insertRequest.run('tr1', 's3', 'React Global State', 'OPEN', 'Mar 18');
    insertRequest.run('tr2', 's4', 'Discrete Math', 'OPEN', 'Mar 19');
  }

  // Seed Lounges
  if ((db.prepare('SELECT COUNT(*) as count FROM lounges').get() as any).count === 0) {
    const insertLounge = db.prepare('INSERT INTO lounges (id, title, host_id, members, date, time, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertLounge.run('l1', 'Data Structures Sprint', 's1', 4, '2026-03-17', '22:00', 1);
    insertLounge.run('l2', 'Calculus III Group', 's2', 2, '2026-03-18', '14:00', 0);
  }
}

seedDatabase();

// Real-time WebSocket Logic
function broadcastEvent(type: string, payload: any) {
  if (!wss) return;
  const msg = JSON.stringify({ type, payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) { // OPEN
      client.send(msg);
    }
  });
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

// Admin DB Backup API
app.get('/api/admin/backup', (req, res) => {
  try {
    res.download('sentinel.db', 'sentinel_backup.db');
  } catch (err) {
    console.error('Backup failed:', err);
    res.status(500).json({ error: 'Failed to generate backup' });
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

// Admin User Management CRUD
app.get('/api/admin/users', (req, res) => {
  const users = db.prepare('SELECT id, username, role, department, name, email FROM users').all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { username, password, role, department, name, email } = req.body;
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO users (id, username, password, role, department, name, email) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, username, password || 'password', role, department, name, email);
    res.json({ success: true, userId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { role, department, name, email } = req.body;
  try {
    db.prepare('UPDATE users SET role = ?, department = ?, name = ?, email = ? WHERE id = ?')
      .run(role, department, name, email, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Broadcasts APIs
app.get('/api/broadcasts', (req, res) => {
  res.json(db.prepare('SELECT * FROM broadcasts ORDER BY timestamp DESC').all());
});
app.post('/api/broadcasts', (req, res) => {
  const { title, message, author, roleTarget } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO broadcasts (id, title, message, author, role_target) VALUES (?, ?, ?, ?, ?)').run(id, title, message, author, roleTarget);
  res.json({ success: true, broadcastId: id });
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
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.json(user);
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
app.get('/api/admin/users', (req, res) => {
  const users = db.prepare('SELECT id, name, role, department, username FROM users').all();
  res.json(users);
});

// Create/Update User
app.post('/api/users', (req, res) => {
  const { id, username, password, role, name, department } = req.body;
  const userId = id || uuidv4();
  db.prepare('INSERT OR REPLACE INTO users (id, username, password, role, name, department) VALUES (?, ?, ?, ?, ?, ?)')
    .run(userId, username, password || 'password', role, name, department);
  res.json({ success: true, id: userId });
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
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
  db.prepare("UPDATE attendance_sessions SET status = 'CLOSED' WHERE id = ?").run(sessionId);
  // Broadcast session stopped
  broadcastEvent('SESSION_STOPPED', { sessionId });
  res.json({ success: true });
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
    if (distance > 150) { // 150 meters radius
      return res.status(403).json({ error: `You are too far from the classroom (${Math.round(distance)}m). You must be within 150m.` });
    }
  } else if (!latitude || !longitude) {
    return res.status(403).json({ error: 'Location required to mark attendance securely.' });
  }

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

// Get attendance records for a specific session
app.get('/api/attendance/session/:sessionId/records', (req, res) => {
  const records = db.prepare(
    'SELECT a.*, u.name as student_name FROM attendance a JOIN users u ON a.user_id = u.id WHERE a.session_id = ? ORDER BY a.timestamp DESC'
  ).all(req.params.sessionId);
  res.json(records);
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
    flashcards: JSON.parse(note.flashcards),
    quiz: JSON.parse(note.quiz)
  })));
});

app.post('/api/notes', (req, res) => {
  const { userId, title, content, summary, keyPoints, flashcards, quiz } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO notes (id, user_id, title, content, summary, key_points, flashcards, quiz) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, title, content, summary, JSON.stringify(keyPoints), JSON.stringify(flashcards), JSON.stringify(quiz));
  res.json({ success: true, id });
});

// WebSocket for Global Chat & Attendance
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    if (data.type === 'CHAT_MESSAGE') {
      const msgId = uuidv4();
      db.prepare('INSERT INTO global_chat (id, user_id, message) VALUES (?, ?, ?)')
        .run(msgId, data.userId, data.text);
      
      // Broadcast to all
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'NEW_CHAT', ...data }));
        }
      });
    }
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
