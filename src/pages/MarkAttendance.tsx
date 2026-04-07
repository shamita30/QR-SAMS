import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  QrCode, CheckCircle2, 
  Loader2, Shield, ArrowLeft, Camera, Smile, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuthStore } from '../store/useAuthStore';
import { io } from 'socket.io-client';

type MarkStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'DUPLICATE' | 'ERROR' | 'NO_TOKEN';

const MarkAttendance: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<MarkStatus>(token ? 'IDLE' : 'NO_TOKEN');
  const [message, setMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState<string | null>(null);
  const [feedbackEmoji, setFeedbackEmoji] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Use manualToken state for OD URL when not marking via token
  const [odUrl, setOdUrl] = useState('');

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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      markAttendance(manualToken.trim().toUpperCase());
    }
  };

  const handleOdSubmit = async () => {
    if (!odUrl || !user) return;
    setStatus('LOADING');
    try {
      const { latitude, longitude } = await getGeoLocation();
      const res = await fetch('/api/attendance/od-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: searchParams.get('sessionId') || 'auto-detect', 
          userId: user.id, 
          odLetterUrl: odUrl,
          latitude, longitude 
        })
      });
      if (res.ok) {
        setStatus('SUCCESS');
        setMessage('OD Request transmitted successfully. Waiting for faculty review.');
        setOdUrl('');
      } else {
        setStatus('ERROR');
        setMessage('OD Protocol failed. Ensure your session node is valid.');
      }
    } catch (e) { setStatus('ERROR'); }
  };

  return (
    <>
      <div className="min-h-screen py-20 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="glass-card p-10 text-center space-y-8">
            <div>
              <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <QrCode size={40} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Mark Attendance</h1>
              <p className="text-sm text-white/40 mt-2">{user?.name} • {user?.department}</p>
            </div>

            <AnimatePresence mode="wait">
              {status === 'LOADING' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
                  <Loader2 size={48} className="mx-auto text-primary animate-spin" />
                </motion.div>
              )}

              {status === 'SUCCESS' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 py-6">
                  <CheckCircle2 size={64} className="mx-auto text-accent" />
                  <h2 className="text-xl font-bold text-accent">Protocol Success</h2>
                  <p className="text-sm text-white/50">{message}</p>
                </motion.div>
              )}

              {(status === 'IDLE' || status === 'NO_TOKEN' || status === 'ERROR' || status === 'DUPLICATE') && (
                <div className="space-y-6">
                  {status === 'ERROR' && <p className="text-red-400 text-sm font-bold">{message}</p>}
                  {status === 'DUPLICATE' && <p className="text-yellow-400 text-sm font-bold">{message}</p>}

                  {showScanner ? (
                    <div id="qr-reader" className="w-full bg-black rounded-2xl overflow-hidden border border-white/10"></div>
                  ) : (
                    <>
                      <button onClick={() => setShowScanner(true)} className="w-full py-5 rounded-2xl bg-primary/20 text-primary border border-primary/30 font-bold flex items-center justify-center gap-2 hover:bg-primary/30 transition-all uppercase tracking-widest text-xs">
                        <Camera size={18} /> Enable Optical Scanner
                      </button>
                      <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div><div className="relative flex justify-center text-[10px] uppercase font-bold text-white/20"><span className="bg-[#050a1f] px-2">Manual Cipher</span></div></div>
                      <form onSubmit={handleManualSubmit} className="space-y-4">
                        <input
                          type="text"
                          value={manualToken}
                          onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl font-mono tracking-widest outline-none focus:border-primary/50"
                          placeholder="ENTER TOKEN"
                        />
                        <button type="submit" className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-all">
                          Verify Token
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </AnimatePresence>

            <Link to="/dashboard" className="text-xs text-white/20 hover:text-white flex items-center justify-center gap-2 pt-4">
               <ArrowLeft size={14} /> Return to Home
            </Link>
          </div>

          {/* OD Submission */}
          <div className="glass-card p-8 border-l-4 border-l-primary relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                <Shield size={80} />
             </div>
             <h3 className="font-bold flex items-center gap-2 mb-2 text-primary">
                <Send size={18} /> On Duty Protocol
             </h3>
             <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">Off-site Academic Verification</p>
             
             <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Paste OD Letter Link (Drive/Cloud)"
                  value={odUrl}
                  onChange={(e) => setOdUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-primary/50 placeholder:text-white/10"
                />
                <button 
                  onClick={handleOdSubmit}
                  className="w-full py-4 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-widest text-[10px] hover:bg-primary/20 transition-all"
                >
                  Submit for Review & Geo-check
                </button>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Persistence Feedback */}
      <AnimatePresence>
        {feedbackSession && !feedbackSubmitted && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
             <div className="relative w-full max-w-sm glass p-8 rounded-[2.5rem] border border-primary/30 text-center">
                <Smile size={48} className="mx-auto text-primary mb-4" />
                <h2 className="text-xl font-bold mb-6 uppercase tracking-widest">Session Feedback</h2>
                <div className="flex justify-center gap-4 mb-6">
                   {['😊', '😐', '😔'].map(e => (
                     <button key={e} onClick={() => setFeedbackEmoji(e)} className={`text-4xl p-2 rounded-2xl ${feedbackEmoji === e ? 'bg-primary/20 scale-110' : 'opacity-40'}`}>{e}</button>
                   ))}
                </div>
                <textarea 
                  value={feedbackComment} 
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-sm h-24 placeholder:text-white/10"
                  placeholder="Optional notes..."
                ></textarea>
                <div className="flex gap-2">
                   <button onClick={() => setFeedbackSession(null)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-white/20">Skip</button>
                   <button 
                     onClick={async () => {
                        const res = await fetch('/api/attendance/session/feedback', {
                           method: 'POST', headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ sessionId: feedbackSession, studentId: user?.id, emoji: feedbackEmoji, comment: feedbackComment })
                        });
                        if (res.ok) setFeedbackSubmitted(true);
                     }}
                     className="flex-[2] py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest"
                   >Submit</button>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MarkAttendance;
