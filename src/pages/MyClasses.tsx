import React from 'react';
import { 
  BookOpen, Clock, Users, MapPin, 
  ExternalLink, Video, FileText, CheckCircle2,
  Calendar, Search, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const MyClasses: React.FC = () => {
  const classes = [
    { 
      id: 'CS301', 
      title: 'Cloud Computing', 
      instructor: 'Dr. Sarah Smith', 
      time: '10:00 - 11:30', 
      room: 'LH-04', 
      attendance: 98,
      nextTopic: 'AWS Lambda & Serverless'
    },
    { 
      id: 'CS302', 
      title: 'Database Systems', 
      instructor: 'Prof. James Wilson', 
      time: '13:00 - 14:30', 
      room: 'LAB-02', 
      attendance: 85,
      nextTopic: 'B-Tree Indexing Optimization'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" /> Curriculumn Nexus
          </h1>
          <p className="text-white/50">Manage your active semesters and classroom resources</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
             <Calendar size={18} /> Full Timeline
          </button>
          <button className="btn-primary">
            <Video size={18} /> Join Virtual Session
          </button>
        </div>
      </div>

      <div className="flex gap-4 p-4 glass rounded-2xl border border-white/10 items-center justify-between">
         <div className="flex gap-6 items-center">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Semester</p>
               <p className="text-lg font-bold italic tracking-tighter text-primary">SEMESTER VII / 2026</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Enrollment Status</p>
               <p className="text-lg font-bold flex items-center gap-2"><CheckCircle2 size={18} className="text-accent" /> VERIFIED</p>
            </div>
         </div>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none w-64 focus:border-primary/50" placeholder="Search resources..." />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map((cls, idx) => (
          <motion.div 
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 flex flex-col gap-6 group hover:border-primary/30"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary italic uppercase tracking-widest">{cls.id}</p>
                <h3 className="text-2xl font-bold tracking-tight">{cls.title}</h3>
                <p className="text-white/40 text-sm">{cls.instructor}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                 <span className="text-lg font-bold">{cls.attendance}%</span>
                 <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Attendance</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Time Slot</p>
                  <p className="text-sm font-bold">{cls.time}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10} /> Room / Link</p>
                  <p className="text-sm font-bold">{cls.room}</p>
               </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
               <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Upcoming Module</p>
               <p className="font-bold text-sm flex items-center justify-between">
                 {cls.nextTopic}
                 <ExternalLink size={14} className="opacity-40" />
               </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 btn-secondary py-3 text-xs justify-center hover:bg-primary/10 transition-all font-bold group-hover:border-primary/50">
                <FileText size={16} /> Course Assets
              </button>
              <button className="flex-1 btn-secondary py-3 text-xs justify-center hover:bg-primary/10 transition-all font-bold group-hover:border-primary/50">
                <Users size={16} /> Class Group
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyClasses;
