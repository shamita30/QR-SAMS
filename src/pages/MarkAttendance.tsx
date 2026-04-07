import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  QrCode, CheckCircle2, XCircle, AlertTriangle, 
  Loader2, Shield, ArrowLeft, Camera, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuthStore } from '../store/useAuthStore';
import { io } from 'socket.io-client';

type MarkStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'DUPLICATE' | 'ERROR' | 'NO_TOKEN';

const MarkAttendance: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<MarkStatus>(token ? 'IDLE' : 'NO_TOKEN');
  const [message, setMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState<string | null>(null);
  const [feedbackEmoji, setFeedbackEmoji] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Listen for session stopped to trigger feedback
  useEffect(() => {
    if (!user) return;
    const wsUrl = window.location.port === '3000'
      ? `http://${window.location.hostname}:3001`
      : window.location.origin;
    const socket = io(wsUrl);
    socket.on('event', (data: any) => {
      if (data.type === 'SESSION_STOPPED' && data.payload?.attendees) {
        const isAttendee = data.payload.attendees.some((a: any) => a.user_id === user.id);
        if (isAttendee) {
          setFeedbackSession(data.payload.sessionId);
        }
      }
    });
    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('qr-reader', { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
      }, false);
      scanner.render((decodedText: string) => {
        scanner.clear();
        setShowScanner(false);
        // Sometimes the decoded text might be a full URL if they scan the standard URL. 
        // We'll extract token from URL if present.
        try {
          const url = new URL(decodedText);
          const urlToken = url.searchParams.get('token');
          if (urlToken) markAttendance(urlToken.trim().toUpperCase());
          else markAttendance(decodedText.trim().toUpperCase());
        } catch(e) {
            markAttendance(decodedText.trim().toUpperCase());
        }
      }, (_err: any) => { /* ignore */ });
      return () => {
        scanner.clear().catch((e: any) => console.warn(e));
      };
    }
  }, [showScanner]);

  const getGeoLocation = (): Promise<{latitude: number | null, longitude: number | null}> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ latitude: null, longitude: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (_err: any) => resolve({ latitude: null, longitude: null }),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const markAttendance = async (tokenToUse: string) => {
    if (!tokenToUse || !user) return;
    setStatus('LOADING');
    try {
      const { latitude, longitude } = await getGeoLocation();
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToUse, userId: user.id, latitude, longitude })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('SUCCESS');
        setMessage(`Attendance marked for ${data.courseName}!`);
      } else if (res.status === 409) {
        setStatus('DUPLICATE');
        setMessage(data.error || 'Already marked');
      } else {
        setStatus('ERROR');
        setMessage(data.error || 'Failed to mark attendance');
      }
    } catch (e) {
      setStatus('ERROR');
      setMessage('Network error. Please try again.');
    }
  };

  useEffect(() => {
    // If token in URL — auto-mark on load
    if (token && user && status === 'IDLE') {
      markAttendance(token);
    }
  }, [token, user]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      markAttendance(manualToken.trim().toUpperCase());
    }
  };

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-10 text-center space-y-8">
          {/* Header */}
          <div>
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <QrCode size={40} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Mark Attendance</h1>
            <p className="text-sm text-white/40 mt-2">
              {user?.name} • {user?.department || 'General'}
            </p>
          </div>

          {/* Status Display */}
          <AnimatePresence mode="wait">
            {status === 'LOADING' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 py-6">
                <Loader2 size={48} className="mx-auto text-primary animate-spin" />
                <p className="text-sm text-white/60 font-medium">Verifying token...</p>
              </motion.div>
            )}

            {status === 'SUCCESS' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 py-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                  <CheckCircle2 size={40} className="text-accent" />
                </div>
                <h2 className="text-xl font-bold text-accent">Attendance Marked!</h2>
                <p className="text-sm text-white/50">{message}</p>
                <p className="text-xs text-white/30 mt-4">You may close this page now.</p>
              </motion.div>
            )}

            {status === 'DUPLICATE' && (
              <motion.div key="duplicate" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 py-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                  <AlertTriangle size={40} className="text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold text-yellow-500">Already Marked</h2>
                <p className="text-sm text-white/50">{message}</p>
              </motion.div>
            )}

            {status === 'ERROR' && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 py-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <XCircle size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-400">Failed</h2>
                <p className="text-sm text-white/50">{message}</p>
                <button onClick={() => { setStatus('NO_TOKEN'); setMessage(''); }} className="btn-secondary mx-auto mt-4">
                  Try Again
                </button>
              </motion.div>
            )}

            {(status === 'IDLE' || status === 'NO_TOKEN') && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-4 glass rounded-2xl border border-primary/10 bg-primary/5">
                  <Shield size={20} className="text-primary mx-auto mb-2" />
                  <p className="text-xs text-white/50">Enter the attendance code displayed on your professor's screen to mark your presence.</p>
                </div>

                {showScanner ? (
                   <div className="space-y-4">
                     <div id="qr-reader" className="w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 [&_button]:bg-white/10 [&_button]:hover:bg-white/20 [&_button]:text-white [&_button]:font-bold [&_button]:py-2 [&_button]:px-4 [&_button]:rounded-xl [&_button]:m-2 [&_select]:bg-background [&_select]:text-white [&_select]:p-3 [&_select]:rounded-xl [&_select]:border [&_select]:border-white/20 [&_select]:w-full [&_select]:max-w-xs [&_select]:my-2"></div>
                     <button onClick={() => setShowScanner(false)} className="mx-auto text-xs text-white/40 hover:text-white block">Cancel Scanner</button>
                   </div>
                ) : (
                  <>
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="w-full py-4 rounded-2xl font-bold text-sm bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-all flex items-center justify-center gap-2 mb-6"
                   >
                     <Camera size={18} /> Scan QR Code
                   </button>
                   <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/30 mb-6">
                     <div className="flex-1 h-px bg-white/10" /> OR <div className="flex-1 h-px bg-white/10" />
                   </div>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Session Token</label>
                      <input
                        type="text"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                        placeholder="e.g. A1B2C3D4"
                        maxLength={8}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-mono font-bold tracking-[0.3em] outline-none focus:border-primary/50 uppercase placeholder:text-white/10 placeholder:text-base placeholder:tracking-normal"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={manualToken.length < 4}
                      className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        manualToken.length >= 4 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40' 
                          : 'bg-white/5 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 size={18} /> Mark My Attendance
                    </button>
                  </form>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back link */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mx-auto text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>

    {/* Session Feedback Overlay */}
    <AnimatePresence>
      {feedbackSession && !feedbackSubmitted && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/90 backdrop-blur-2xl" />
          <motion.div initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-sm glass p-10 rounded-[3rem] border border-primary/30 text-center shadow-2xl">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <Smile size={28} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Class Feedback</h2>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-8">How was today's session?</p>

            <div className="flex justify-center gap-4 mb-8">
              {[{ e: '😊', label: 'Great' }, { e: '😐', label: 'Average' }, { e: '😔', label: 'Poor' }].map(({ e, label }) => (
                <button key={e} onClick={() => setFeedbackEmoji(e)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${ feedbackEmoji === e ? 'bg-primary/20 border-primary scale-110' : 'border-white/10 hover:border-primary/40' }`}>
                  <span className="text-3xl">{e}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Any thoughts? (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-primary/50 transition-all resize-none h-20 mb-6 placeholder:text-white/20"
            />

            <button
              disabled={!feedbackEmoji}
              onClick={async () => {
                if (!feedbackEmoji || !feedbackSession || !user) return;
                await fetch('/api/attendance/session/feedback', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId: feedbackSession, studentId: user.id, emoji: feedbackEmoji, comment: feedbackComment })
                });
                setFeedbackSubmitted(true);
                setTimeout(() => setFeedbackSession(null), 2500);
              }}
              className="w-full py-4 bg-primary/20 text-primary border border-primary/30 rounded-2xl font-bold uppercase tracking-widest hover:bg-primary/30 transition-all disabled:opacity-40"
            >
              Submit Feedback
            </button>
            <button onClick={() => setFeedbackSession(null)} className="mt-4 text-[10px] text-white/20 hover:text-white/50 uppercase tracking-widest">Skip</button>
          </motion.div>
        </div>
      )}
      {feedbackSubmitted && feedbackSession && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative glass p-10 rounded-[3rem] text-center border border-accent/30">
            <p className="text-4xl mb-4">🙏</p>
            <h3 className="text-xl font-bold text-accent">Thank you!</h3>
            <p className="text-white/50 text-sm mt-2">Your feedback has been recorded.</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default MarkAttendance;
