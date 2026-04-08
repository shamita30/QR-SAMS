import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, Calendar, Search,
  QrCode, Square, Play, CheckCircle, Wifi, UserCheck, AlertCircle, BarChart, Copy, RefreshCw, Keyboard, X,
  MessageSquare, Volume2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const AttendanceManager: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  // CONFIGURATION: Set QR Session Duration (in seconds)
  const QR_REFRESH_INTERVAL = 5;

  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<any[]>([]);

  // Session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionCourseId, setActiveSessionCourseId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [liveRecords, setLiveRecords] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(QR_REFRESH_INTERVAL);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualStatus, setManualStatus] = useState<'PRESENT' | 'ABSENT' | 'ON_DUTY'>('PRESENT');
  const [roster, setRoster] = useState<any[]>([]);
  const [showRoster, setShowRoster] = useState(false);

  const wsRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isHOD = user?.role === 'HOD';

  const isFaculty = user?.role === 'FACULTY';
  const dept = user?.department;

  useEffect(() => {
    if (activeSessionCourseId) {
      fetch(`/api/courses/${activeSessionCourseId}/analytics`)
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
      wsRef.current?.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [user]);

  const connectWebSocket = () => {
    const wsUrl = window.location.port === '3000'
      ? `http://${window.location.hostname}:3001`
      : window.location.origin;

    import('socket.io-client').then(({ io }) => {
      const socket = io(wsUrl);
      wsRef.current = socket;

      socket.on('event', (data: any) => {
        if (data.type === 'ATTENDANCE_MARKED') {
          const payload = data.payload;
          setLiveRecords(prev => {
            if (prev.find(r => r.studentId === payload.studentId)) return prev;
            return [{
              studentId: payload.studentId,
              studentName: payload.studentName,
              department: payload.department,
              timestamp: new Date(payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }, ...prev];
          });
        }

        if (data.type === 'ABSENCE_NOTIFICATION') {
          const { studentName, courseName, parentPhone } = data.payload;

          // AI Voice Protocol
          const msg = new SpeechSynthesisUtterance();
          msg.text = `Attention faculty. Initiating automated protocol for ${studentName}. Absence detected in ${courseName}. Calling parent at mobile node ending in ${parentPhone.slice(-4)}.`;
          msg.rate = 0.9;
          msg.pitch = 1.1;
          window.speechSynthesis.speak(msg);

          addToast(`AI Call initiated for ${studentName}`, 'INFO');
        }
      });
    });
  };

  const fetchCourses = async () => {
    try {
      let url = '/api/courses';
      if (isFaculty) {
        url = `/api/courses?facultyId=${user?.id}`;
      } else if (isHOD) {
        url = `/api/courses?dept=${dept}`;
      }
      const res = await fetch(url);
      if (res.ok) setCourses(await res.json());
    } catch (e) {
      console.error('Failed to fetch courses:', e);
    }
  };

  const getGeoLocation = (): Promise<{ latitude: number | null, longitude: number | null }> => {
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

  const fetchRoster = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/students`);
      if (res.ok) setRoster(await res.json());
    } catch (e) {
      console.error('Failed to fetch roster:', e);
    }
  };

  const startSession = async (courseId: string) => {
    try {
      const { latitude, longitude } = await getGeoLocation();
      const res = await fetch('/api/attendance/session/start', {
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
        setCountdown(QR_REFRESH_INTERVAL);
        startRefreshTimer(data.sessionId);
        fetchSessionRecords(data.sessionId);
        fetchRoster(courseId);
        addToast(`QR Session Started for ${courseId}`, 'SUCCESS');
      } else {
        addToast('Failed to start session', 'ERROR');
      }
    } catch (e) {
      console.error('Failed to start session:', e);
      addToast('Network error starting session', 'ERROR');
    }
  };

  const markStatus = async (studentId: string, status: string) => {
    if (!activeSessionId) return;
    try {
      const res = await fetch('/api/attendance/mark-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId, studentId, status })
      });
      if (res.ok) {
        addToast(`Identity protocol updated to ${status}`, 'SUCCESS');
        fetchSessionRecords(activeSessionId);
      }
    } catch (e) {
      addToast('Command transmission failed', 'ERROR');
    }
  };

  const stopSession = async () => {
    if (!activeSessionId) return;
    try {
      const res = await fetch('/api/attendance/session/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId })
      });
      if (res.ok) addToast('QR Session stopped successfully', 'INFO');
    } catch (e) {
      console.error('Failed to stop session:', e);
      addToast('Failed to stop session', 'ERROR');
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
      const res = await fetch('/api/attendance/session/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionToken(data.token);
        setCountdown(QR_REFRESH_INTERVAL);
        addToast('Dynamic token refreshed', 'INFO');
      } else {
        addToast('Failed to refresh token', 'ERROR');
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
        if (prev <= 1) return QR_REFRESH_INTERVAL;
        return prev - 1;
      });
    }, 1000);

    // Token refresh every X seconds
    refreshTimerRef.current = setInterval(() => {
      refreshToken();
    }, QR_REFRESH_INTERVAL * 1000);
  };

  const fetchSessionRecords = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/attendance/session/${sessionId}/records`);
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

  const getDistance = (lat1: number | null, lon1: number | null, lat2: number | null, lon2: number | null) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in meters
  };

  const markUrl = sessionToken ? `${window.location.origin}/mark-attendance?token=${sessionToken}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(markUrl);
    addToast('Attendance link copied to clipboard', 'SUCCESS');
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
          <button
            onClick={() => addToast('History logs loaded', 'INFO')}
            className="btn-secondary"
          >
            <Calendar size={18} /> History
          </button>
          {activeSessionId && (
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all text-sm font-bold"
            >
              <Keyboard size={16} /> Manual Entry
            </button>
          )}
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
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeSessionCourseId === course.id
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
                <div className="flex items-center gap-2">
                  {activeSessionId && (
                    <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                      <Volume2 size={14} className="text-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-primary/60 uppercase">AI Voice Active</span>
                      <MessageSquare size={14} className="text-primary/40 ml-1" />
                    </div>
                  )}
                  <button
                    onClick={() => setShowRoster(!showRoster)}
                    className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${showRoster ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/40'}`}
                  >
                    {showRoster ? 'Back to Feed' : 'View Full Roster'}
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                      {liveRecords.length} Present
                    </span>
                  </div>
                </div>
              </div>

              {showRoster ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {roster.map(student => {
                    const record = liveRecords.find(r => r.studentId === student.id);
                    const isPresent = record?.status?.includes('PRESENT');
                    const isOD = record?.status === 'ON_DUTY' || record?.status === 'OD_PENDING';
                    const isAbsent = record?.status === 'ABSENT';

                    return (
                      <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isPresent ? 'bg-green-500/10 border-green-500/20 shadow-lg shadow-green-500/5' :
                        isOD ? 'bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/5' :
                          isAbsent ? 'bg-red-500/10 border-red-500/20' :
                            'bg-white/5 border-white/5'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isPresent ? 'bg-green-500/20 text-green-400' :
                            isOD ? 'bg-blue-500/20 text-blue-400' :
                              isAbsent ? 'bg-red-500/20 text-red-400' :
                                'bg-white/10 text-white/40'
                            }`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isPresent || isOD || isAbsent ? 'text-white' : 'text-white/40'}`}>
                              {student.name}
                              {record?.status === 'OD_PENDING' && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-500 text-white text-[8px] font-bold animate-pulse">OD REQ</span>
                              )}
                            </p>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">
                              {student.id}
                              {record?.od_letter_url && <a href={record.od_letter_url} target="_blank" className="ml-2 text-primary hover:underline font-bold">View Letter</a>}
                              {record?.latitude && activeCourse && (
                                (() => {
                                  const dist = getDistance(activeSessionId ? courses.find(c => c.id === activeSessionCourseId)?.latitude : null,
                                    activeSessionId ? courses.find(c => c.id === activeSessionCourseId)?.longitude : null,
                                    record.latitude, record.longitude);
                                  if (dist === null) return null;
                                  const isTooFar = dist > 150;
                                  return (
                                    <span className={`ml-3 px-2 py-0.5 rounded-full text-[8px] font-bold ${isTooFar ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400'}`}>
                                      {isTooFar ? 'PROXY ALERT: ' : ''}{Math.round(dist)}m away
                                    </span>
                                  );
                                })()
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markStatus(student.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${isPresent ? 'bg-green-500 text-white' : 'bg-white/5 text-white/40 hover:bg-green-500/20'}`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markStatus(student.id, 'ON_DUTY')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${isOD ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:bg-blue-500/20'}`}
                          >
                            {record?.status === 'OD_PENDING' ? 'Approve OD' : 'OD'}
                          </button>
                          <button
                            onClick={() => markStatus(student.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${isAbsent ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40 hover:bg-red-500/20'}`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
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
              )}
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
                      animate={{ width: `${(countdown / QR_REFRESH_INTERVAL) * 100}%` }}
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

      {/* Manual Attendance Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowManualModal(false)} />
            <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }} className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-yellow-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2 text-yellow-400"><Keyboard size={20} /> Manual Entry</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Enter student ID or username to mark attendance</p>
                </div>
                <button onClick={() => setShowManualModal(false)} className="p-2 glass rounded-xl text-white/40 hover:text-white transition-colors"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Student ID / Username</label>
                  <input
                    value={manualStudentId}
                    onChange={(e) => setManualStudentId(e.target.value)}
                    className="w-full bg-white/5 border border-yellow-500/30 rounded-2xl p-4 outline-none focus:border-yellow-500/60 text-sm font-bold mt-1"
                    placeholder="e.g. s1 or student2"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Status Payload</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as any)}
                    className="w-full bg-white/5 border border-yellow-500/30 rounded-2xl p-4 outline-none focus:border-yellow-500/60 text-sm font-bold mt-1 appearance-none"
                  >
                    <option value="PRESENT" className="bg-background">Present (Manual)</option>
                    <option value="ON_DUTY" className="bg-background">On Duty (OD)</option>
                    <option value="ABSENT" className="bg-background">Absent (Trigger AI)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={!manualStudentId.trim()}
                    onClick={async () => {
                      if (!manualStudentId.trim() || !activeSessionId) return;
                      try {
                        const res = await fetch('/api/attendance/manual', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sessionId: activeSessionId, studentId: manualStudentId.trim(), status: manualStatus })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          addToast(`✓ Identity recorded as ${manualStatus}: ${data.studentName || manualStudentId}`, 'SUCCESS');
                          setManualStudentId('');
                          setShowManualModal(false);
                          fetchSessionRecords(activeSessionId);
                        } else {
                          addToast(data.error || 'Failed to mark manually.', 'ERROR');
                        }
                      } catch { addToast('Network error.', 'ERROR'); }
                    }}
                    className="flex-1 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-yellow-500/30 transition-all disabled:opacity-40"
                  >
                    Execute Command
                  </button>
                  <button onClick={() => setShowManualModal(false)} className="px-6 glass rounded-2xl text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-all">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceManager;
