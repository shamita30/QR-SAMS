import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, Calendar, Search, 
  QrCode, Square, Play, CheckCircle, Wifi, UserCheck, AlertCircle, BarChart, Copy, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

interface LiveRecord {
  studentId: string;
  studentName: string;
  department: string;
  timestamp: string;
}

const AttendanceManager: React.FC = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<any[]>([]);

  // Session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionCourseId, setActiveSessionCourseId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [liveRecords, setLiveRecords] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(30);
  const [analytics, setAnalytics] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isHOD = user?.role === 'HOD';
  const isAdmin = user?.role === 'ADMIN';
  const isFaculty = user?.role === 'FACULTY';
  const dept = user?.department;

  useEffect(() => {
    if (activeSessionCourseId) {
      fetch(`http://localhost:3001/api/courses/${activeSessionCourseId}/analytics`)
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(console.error);
    } else {
      setAnalytics(null);
    }
  }, [activeSessionCourseId]);

  useEffect(() => {
    fetchCourses();
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [user]);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.hostname}:3001`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ATTENDANCE_MARKED') {
        setLiveRecords(prev => [{
          studentId: data.studentId,
          studentName: data.studentName,
          department: data.department,
          timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }, ...prev]);
      }
    };
  };

  const fetchCourses = async () => {
    try {
      let url = 'http://localhost:3001/api/courses';
      if (isFaculty) {
        url = `http://localhost:3001/api/courses?facultyId=${user?.id}`;
      } else if (isHOD) {
        url = `http://localhost:3001/api/courses?dept=${dept}`;
      }
      const res = await fetch(url);
      if (res.ok) setCourses(await res.json());
    } catch (e) {
      console.error('Failed to fetch courses:', e);
    }
  };

  const getGeoLocation = (): Promise<{latitude: number | null, longitude: number | null}> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => {
          console.warn("Geolocation not available/denied:", err);
          resolve({ latitude: null, longitude: null });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const startSession = async (courseId: string) => {
    try {
      const { latitude, longitude } = await getGeoLocation();
      const res = await fetch('http://localhost:3001/api/attendance/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, facultyId: user?.id, department: dept, latitude, longitude })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSessionId(data.sessionId);
        setActiveSessionCourseId(courseId);
        setSessionToken(data.token);
        setLiveRecords([]);
        setCountdown(30);
        startRefreshTimer(data.sessionId);
        // Fetch any existing records for this session
        fetchSessionRecords(data.sessionId);
      }
    } catch (e) {
      console.error('Failed to start session:', e);
    }
  };

  const stopSession = async () => {
    if (!activeSessionId) return;
    try {
      await fetch('http://localhost:3001/api/attendance/session/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId })
      });
    } catch (e) {
      console.error('Failed to stop session:', e);
    }
    setActiveSessionId(null);
    setActiveSessionCourseId(null);
    setSessionToken(null);
    setLiveRecords([]);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const refreshToken = useCallback(async () => {
    if (!activeSessionId) return;
    try {
      const res = await fetch('http://localhost:3001/api/attendance/session/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionToken(data.token);
        setCountdown(30);
      }
    } catch (e) {
      console.error('Failed to refresh token:', e);
    }
  }, [activeSessionId]);

  const startRefreshTimer = (_sessionId: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    // Countdown timer
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);

    // Token refresh every 30 seconds
    refreshTimerRef.current = setInterval(() => {
      refreshToken();
    }, 30000);
  };

  const fetchSessionRecords = async (sessionId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/attendance/session/${sessionId}/records`);
      if (res.ok) {
        const records = await res.json();
        setLiveRecords(records.map((r: any) => ({
          studentId: r.user_id,
          studentName: r.student_name,
          department: r.department,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        })));
      }
    } catch (e) {
      console.error('Failed to fetch session records:', e);
    }
  };

  const markUrl = sessionToken ? `${window.location.origin}/mark-attendance?token=${sessionToken}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(markUrl);
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCourse = courses.find(c => c.id === activeSessionCourseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <QrCode className="text-primary" /> Attendance Control
          </h1>
          <p className="text-white/50">{isHOD ? `${dept} Department Overview` : 'Manage your class rosters'}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <Calendar size={18} /> History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Courses List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Active Courses</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredCourses.map(course => (
                <div key={course.id} className="glass p-4 rounded-2xl flex items-center justify-between hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">{course.name}</h3>
                      <p className="text-xs text-white/40 uppercase tracking-wider">{course.id} • {course.time} • {course.dept}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (activeSessionCourseId === course.id) {
                        stopSession();
                      } else {
                        startSession(course.id);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                      activeSessionCourseId === course.id 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                        : 'bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30'
                    }`}
                  >
                    {activeSessionCourseId === course.id ? <><Square size={14} /> Stop session</> : <><Play size={14} /> Start QR</>}
                  </button>
                </div>
              ))}
              {filteredCourses.length === 0 && (
                <p className="text-center text-sm text-white/30 py-8">No courses matching your criteria.</p>
              )}
            </div>
          </div>

          {/* Live Attendance Feed */}
          {activeSessionId && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Wifi size={18} className="text-accent animate-pulse" /> Live Attendance Feed
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                    {liveRecords.length} Present
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                <AnimatePresence initial={false}>
                  {liveRecords.length === 0 ? (
                    <div className="text-center py-12 text-white/20">
                      <UserCheck size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-sm">Waiting for students to scan QR code...</p>
                    </div>
                  ) : (
                    liveRecords.map((record, idx) => (
                      <motion.div
                        key={`${record.studentId}-${idx}`}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5 hover:border-accent/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                            {record.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{record.studentName}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{record.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-accent" />
                          <span className="text-[10px] font-mono text-white/40">{record.timestamp}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Class Analytics & Smart Alerts */}
          {activeSessionCourseId && analytics && (
            <div className="glass-card p-6 mt-6 border-l-4 border-l-accent animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BarChart size={18} className="text-accent" /> Class Performance Analytics
                </h2>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-white/50">
                  <span className="flex items-center gap-2">Avg: <span className="text-white">{analytics.classAverage}%</span></span>
                  <span className="flex items-center gap-2">Enrolled: <span className="text-white">{analytics.totalStudents}</span></span>
                </div>
              </div>

              {analytics.lowPerformers?.length > 0 && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
                    <AlertCircle size={16} /> Smart Alerts: Low Performing Students
                  </h3>
                  <div className="space-y-2">
                    {analytics.lowPerformers.map((st: any) => (
                      <div key={st.id} className="flex items-center justify-between text-xs">
                        <span className="text-white/80">{st.name} ({st.id})</span>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">{st.attendanceScore}% Att.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: QR Code Panel */}
        <div className="space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-primary/20 to-secondary/10 flex flex-col items-center text-center">
            {activeSessionId && sessionToken ? (
              <>
                <div className="w-full aspect-square glass rounded-3xl mb-6 p-6 flex flex-col items-center justify-center relative group overflow-hidden bg-white">
                  <QRCodeSVG 
                    value={markUrl}
                    size={200}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    style={{ width: '100%', height: '100%', maxWidth: '200px', maxHeight: '200px' }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-white/80 px-1 rounded">Live</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1">QR Active</h3>
                <p className="text-sm text-white/50 mb-2">{activeCourse?.name || activeSessionCourseId}</p>
                
                {/* Token display */}
                <div className="w-full p-3 glass rounded-xl mb-4 border border-primary/20">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Session Token</p>
                  <p className="text-2xl font-mono font-bold text-primary tracking-[0.3em]">{sessionToken}</p>
                </div>

                {/* Countdown */}
                <div className="w-full flex items-center gap-3 mb-4">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${(countdown / 30) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-mono text-white/40">{countdown}s</span>
                </div>

                <div className="flex gap-2 w-full">
                  <button onClick={copyLink} className="flex-1 btn-primary justify-center text-xs py-3">
                    <Copy size={14} /> Copy Link
                  </button>
                  <button onClick={refreshToken} className="flex-1 btn-secondary justify-center text-xs py-3">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 text-white/20">
                  <Play size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Session</h3>
                <p className="text-sm text-white/40">Select a course and start a QR session to begin tracking attendance.</p>
              </>
            )}
          </div>

          {/* Stats */}
          {activeSessionId && (
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4">Session Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 uppercase tracking-widest">Students Marked</span>
                  <span className="text-2xl font-bold text-accent">{liveRecords.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 uppercase tracking-widest">Session Status</span>
                  <span className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded-full">ACTIVE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManager;
