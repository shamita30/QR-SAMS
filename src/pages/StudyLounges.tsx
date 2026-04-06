import React, { useState } from 'react';
import { 
  Plus, Coffee, Calendar, Clock, 
  Users, MessageSquare, ScreenShare,
  Mic, Video, PhoneOff, Send,
  Activity, Shield, ChevronRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';

import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useSocketStore } from '../store/useSocketStore';
import { AnimatePresence } from 'framer-motion';

const StudyLounges: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { socket } = useSocketStore();
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [lounges, setLounges] = useState<any[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomTags, setNewRoomTags] = useState('');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const fetchLounges = async () => {
    try {
      const res = await fetch('/api/lounges');
      if (res.ok) setLounges(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleCreateRoom = async () => {
    if (!newRoomTitle.trim()) return;
    try {
      const res = await fetch('/api/lounges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRoomTitle,
          hostId: user?.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isPrivate: false
        })
      });
      if (res.ok) {
        addToast('Secure node provisioned.', 'SUCCESS');
        setShowCreateModal(false);
        setNewRoomTitle('');
        setNewRoomTags('');
        fetchLounges();
      }
    } catch (e) {
      addToast('Provisioning failed.', 'ERROR');
    }
  };

  React.useEffect(() => {
    fetchLounges();
  }, []);

  React.useEffect(() => {
    if (socket) {
      socket.on('JOIN_REQUEST', (data: any) => {
        if (activeRoom && activeRoom.host_id === user?.id) {
          setJoinRequests(prev => [...prev, data]);
          addToast(`${data.userName} requested to join your lounge.`, 'INFO');
        }
      });

      socket.on('JOIN_APPROVED', (data: any) => {
         if (data.userId === user?.id) {
           addToast('Host approved your entry.', 'SUCCESS');
           // Join the WebRTC room logic here
         }
      });

      socket.on('LOUNGE_MESSAGE', (data: any) => {
         setRoomMessages(prev => [...prev, data]);
      });
    }
  }, [socket, activeRoom]);

  const handleJoinLounge = (room: any) => {
     if (room.host_id === user?.id) {
        setActiveRoom(room);
        startMedia();
     } else {
        if (socket) {
          socket.emit('JOIN_REQUEST', {
            roomId: room.id,
            userId: user?.id,
            userName: user?.name
          });
          addToast('Entry request transmitted to host.', 'INFO');
          // In a real app, wait for approval. For this demo, let's auto-transition to a "Waiting" state
          setActiveRoom({...room, waiting: true});
        }
     }
  };

  const startMedia = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
       setLocalStream(stream);
       if (videoRef.current) videoRef.current.srcObject = stream;
     } catch (e) {
       addToast('Media initialization failed.', 'ERROR');
     }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const handleApprove = (userId: string) => {
    if (socket) {
      socket.emit('APPROVE_JOIN', { roomId: activeRoom.id, userId });
      setJoinRequests(prev => prev.filter(r => r.userId !== userId));
      addToast('Node entry authorized.', 'SUCCESS');
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !socket) return;
    socket.emit('LOUNGE_MESSAGE', {
      roomId: activeRoom.id,
      userId: user?.id,
      name: user?.name,
      text: chatMessage.trim()
    });
    setChatMessage('');
  };


  return (
    <div className="space-y-8 pb-12">
      {!activeRoom ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-primary/60 font-medium tracking-[0.3em] uppercase text-xs mb-2 neon-glow">
                Study Lounges
              </h2>
              <h1 className="text-4xl font-bold text-white font-outfit uppercase tracking-tighter">
                Virtual Hubs
              </h1>
              <p className="text-white/40 mt-2 font-medium">
                Initialize secure peer-learning sessions and knowledge transfers.
              </p>
            </div>
            <NeonButton onClick={() => setShowCreateModal(true)} className="pr-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Plus size={18} /> Provision New Room
            </NeonButton>
          </div>

          {/* Filters */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
             {['All Sessions', 'Live Only', 'My Department', 'Private Segments'].map((f, i) => (
               <button key={f} className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border shrink-0 ${i === 0 ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                  {f}
               </button>
             ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lounges.map((room, i) => (
              <GlassCard key={room.id} delay={i * 0.1}>
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                       <Coffee size={24} />
                    </div>
                    {room.live ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full shadow-[0_0_10px_rgba(0,210,255,0.2)]">
                         <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                         <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Live Node</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                         <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Scheduled</span>
                      </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <div>
                       <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors tracking-tight uppercase leading-tight">{room.title}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-white/40 font-medium">Host: <span className="text-white/60">{room.host}</span></p>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] text-white/30 font-mono italic">#{room.id}</span>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {room.tags?.split(',')?.map((tag: string) => (
                         <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-white/30 uppercase tracking-widest">
                           {tag.trim()}
                         </span>
                       ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Next Shift</p>
                          <p className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                             <Calendar size={12} className="text-primary" /> {room.date}
                          </p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Duration</p>
                          <p className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                             <Clock size={12} className="text-primary" /> {room.time}
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2">
                             {[1, 2, 3].map(i => (
                               <div key={i} className="w-7 h-7 rounded-lg bg-white/5 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white/20 overflow-hidden">
                                  <Users size={12} />
                               </div>
                             ))}
                          </div>
                          <span className="text-[10px] font-bold text-white/40 tracking-tighter">+{room.members} Active</span>
                       </div>
                        <button onClick={() => handleJoinLounge(room)} className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all">
                           <ChevronRight size={18} />
                        </button>
                    </div>
                 </div>
              </GlassCard>
            ))}
          </div>

          {/* Secure Channel Alert */}
          <GlassCard className="border-accent/10 bg-accent/5" hover={false}>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                   <Shield size={24} />
                </div>
                <div className="flex-1">
                   <h4 className="text-white font-bold uppercase tracking-wider">Protocol: Secure Peer-to-Peer</h4>
                   <p className="text-xs text-white/40 mt-0.5 uppercase tracking-widest font-medium">All sessions are end-to-end encrypted under Sentinel Protocol v3.0</p>
                </div>
                <Activity size={24} className="text-accent/20 animate-pulse" />
             </div>
          </GlassCard>

          {/* Create Room Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowCreateModal(false)} />
                 <motion.div initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 40, opacity: 0 }} className="relative w-full max-w-lg glass p-8 rounded-[3rem] border border-white/10 shadow-2xl">
                    <h3 className="text-2xl font-bold uppercase tracking-tighter mb-6 flex items-center gap-3"><Zap className="text-accent" /> Boot New Node</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Node Designation</label>
                        <input value={newRoomTitle} onChange={(e) => setNewRoomTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent/50 text-sm font-bold mt-1" placeholder="e.g. Calculus Intensive" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2">Resource Tags</label>
                        <input value={newRoomTags} onChange={(e) => setNewRoomTags(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-accent/50 text-xs mt-1" placeholder="e.g. Math, Exams (comma separated)" />
                      </div>
                      <div className="pt-4 flex gap-3">
                         <NeonButton onClick={handleCreateRoom} className="flex-1 py-3 text-xs uppercase tracking-widest">Initialize</NeonButton>
                         <button onClick={() => setShowCreateModal(false)} className="px-6 glass rounded-2xl text-xs text-white/40 hover:text-white uppercase font-bold">Abort</button>
                      </div>
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[calc(100vh-14rem)] grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Active Room View would go here - simplified for current task */}
          <GlassCard className="lg:col-span-3 bg-black/40 flex items-center justify-center relative overflow-hidden" hover={false}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
             
             {activeRoom.waiting ? (
                <div className="text-center space-y-6">
                   <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                   <h3 className="text-2xl font-bold uppercase tracking-tighter">Synchronization Pending</h3>
                   <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Waiting for host authorization...</p>
                   <button onClick={() => setActiveRoom(null)} className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] hover:underline">Abort Connection</button>
                </div>
             ) : (
                <div className="w-full h-full relative group">
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     muted={!isMicOn}
                     className="w-full h-full object-cover" 
                   />
                   {!isVideoOn && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl flex items-center justify-center">
                         <div className="text-center">
                            <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                               {activeRoom.host_name?.charAt(0) || user?.name?.charAt(0)}
                            </div>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Visual Feed Suspended</p>
                         </div>
                      </div>
                   )}

                   <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 p-6 glass rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <button 
                        onClick={toggleMic}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMicOn ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
                      >
                         {isMicOn ? <Mic size={24} /> : <PhoneOff size={24} />}
                      </button>
                      <button 
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isVideoOn ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
                      >
                         <Video size={24} />
                      </button>
                      <button 
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isScreenSharing ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                         <ScreenShare size={24} />
                      </button>
                      <button onClick={() => { setActiveRoom(null); localStream?.getTracks().forEach(t => t.stop()); }} className="w-16 h-16 rounded-2xl bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center text-white transition-all ml-4">
                         <PhoneOff size={28} />
                      </button>
                   </div>

                   {/* Join Requests (Host Only) */}
                   <AnimatePresence>
                     {activeRoom.host_id === user?.id && joinRequests.length > 0 && (
                        <div className="absolute top-10 right-10 w-80 space-y-4">
                           {joinRequests.map(req => (
                             <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass p-4 rounded-2xl border-primary/20 bg-primary/5 shadow-2xl">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Sync Request: {req.userName}</p>
                                <div className="flex gap-2">
                                   <button onClick={() => handleApprove(req.userId)} className="flex-1 py-2 bg-primary/20 border border-primary/40 rounded-lg text-[10px] font-bold uppercase text-primary">Approve</button>
                                   <button className="px-4 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase text-white/20">Deny</button>
                                </div>
                             </motion.div>
                           ))}
                        </div>
                     )}
                   </AnimatePresence>
                </div>
             )}
          </GlassCard>

          <div className="flex flex-col gap-6">
             <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col" hover={false}>
                <div className="p-4 border-b border-white/5 bg-white/2">
                   <h4 className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest text-primary">
                      <MessageSquare size={14} /> Room Intelligence
                   </h4>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
                   {roomMessages.length === 0 && (
                      <p className="italic text-center py-2 opacity-50 text-[10px] font-mono">Secure channel initialized...</p>
                   )}
                   {roomMessages.map((msg, i) => (
                      <div key={i} className="space-y-1">
                         <span className={`text-[9px] font-bold ${msg.userId === user?.id ? 'text-primary' : 'text-secondary'}`}>{msg.name}:</span>
                         <p className="text-[10px] text-white/60 leading-tight">{msg.text}</p>
                      </div>
                   ))}
                </div>

                 <div className="p-4 border-t border-white/5">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                       <input 
                         value={chatMessage}
                         onChange={(e) => setChatMessage(e.target.value)}
                         className="w-full bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-[10px] outline-none placeholder:text-white/10 focus:border-primary/40 transition-all font-medium" 
                         placeholder="Broadcast to members..." 
                       />
                       <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform">
                          <Send size={14} />
                       </button>
                    </form>
                 </div>
             </GlassCard>
             
             <GlassCard hover={false} className="p-4 border-primary/20 bg-primary/2">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                   <Zap size={10} className="text-primary" /> Connected Nodes
                </h4>
                <div className="space-y-2">
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Identity_Sec_0{i}</span>
                     </div>
                   ))}
                </div>
             </GlassCard>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudyLounges;
