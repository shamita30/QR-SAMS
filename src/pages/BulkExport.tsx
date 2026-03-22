import React, { useState } from 'react';
import { 
  FileDown, Shield, Database, 
  CheckCircle2, Clock, AlertTriangle,
  FileText, Table, FileCode, Search,
  Filter, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const BulkExport: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'PDF' | 'JSON'>('CSV');
  const [isExporting, setIsExporting] = useState(false);

  const modules = [
    { id: '1', title: 'User Registry', count: 1240, lastUpdate: '2h ago', security: 'HIGH' },
    { id: '2', title: 'Attendance Logs', count: 42100, lastUpdate: '10m ago', security: 'MED' },
    { id: '3', title: 'Project Proposals', count: 156, lastUpdate: '1d ago', security: 'HIGH' },
    { id: '4', title: 'Sentiment Analysis', count: 890, lastUpdate: '4h ago', security: 'MED' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Data package compiled and ready for secure download.');
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileDown className="text-primary" /> Data Sovereignty
          </h1>
          <p className="text-white/50">Compile and export department-wide data packages</p>
        </div>
        <div className="flex gap-3">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border-white/10">
            <Shield className="text-accent" size={16} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Audit Sync: OK</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-card p-0 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white/40">Select Export Modules</h3>
                <div className="flex gap-4">
                  <button className="text-[10px] font-bold text-primary hover:underline uppercase">Select All</button>
                  <button className="text-[10px] font-bold text-white/20 hover:underline uppercase">Clear</button>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {modules.map((m) => (
                  <div key={m.id} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-6">
                       <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                         <CheckCircle2 size={14} />
                       </div>
                       <div>
                         <h4 className="font-bold text-sm tracking-tight">{m.title}</h4>
                         <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter flex items-center gap-1"><Database size={10} /> {m.count.toLocaleString()} Records</span>
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter flex items-center gap-1"><Clock size={10} /> {m.lastUpdate}</span>
                         </div>
                       </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-bold border ${m.security === 'HIGH' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                      {m.security} SECURITY
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass-card p-8 space-y-8">
              <h3 className="font-bold text-xl italic tracking-tighter">Export Configuration</h3>
              
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Package Format</p>
                <div className="grid grid-cols-3 gap-2">
                   {[
                     { id: 'CSV', icon: Table },
                     { id: 'PDF', icon: FileText },
                     { id: 'JSON', icon: FileCode },
                   ].map(f => (
                     <button 
                       key={f.id}
                       onClick={() => setSelectedFormat(f.id as any)}
                       className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${selectedFormat === f.id ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                     >
                       <f.icon size={20} />
                       <span className="text-[10px] font-bold">{f.id}</span>
                     </button>
                   ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                 <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
                 <p className="text-[10px] text-yellow-500/80 leading-relaxed font-bold uppercase tracking-tight">Large exports may take up to 30 seconds to compile. Do not refresh the terminal.</p>
              </div>

              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full btn-primary py-5 rounded-2xl text-lg justify-center font-bold shadow-2xl shadow-primary/40 relative overflow-hidden"
              >
                {isExporting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Compiling...
                  </div>
                ) : (
                  <>Compile Package <ChevronRight className="ml-2" size={20} /></>
                )}
                {isExporting && (
                  <motion.div 
                    initial={{ x: '-100%' }} 
                    animate={{ x: '100%' }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-white/10"
                  />
                )}
              </button>
           </div>

           <div className="glass-card p-6 border-white/5 flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase text-white/20">Encryption</span>
               <span className="text-sm font-bold text-white/60">AES-256 Enabled</span>
             </div>
             <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent">
               <Shield size={20} />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BulkExport;
