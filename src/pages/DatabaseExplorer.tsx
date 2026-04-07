import React, { useState } from 'react';
import { 
  Database, 
  Table, Cpu, Terminal as TerminalIcon, 
  Play, Save, RefreshCcw, Lock
} from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

const DatabaseExplorer: React.FC = () => {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [activeTable, setActiveTable] = useState('users');
  const [logs, setLogs] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [execTime, setExecTime] = useState('0.00ms');
  const { addToast } = useToastStore();

  React.useEffect(() => {
    if (activeTable === 'action_logs') {
      fetch('/api/admin/logs')
        .then(res => res.json())
        .then(data => setLogs(data))
        .catch(console.error);
    } else {
      executeQuery(`SELECT * FROM ${activeTable} LIMIT 10;`);
    }
  }, [activeTable]);

  const executeQuery = async (customQuery?: string) => {
    const q = customQuery || query;
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      const time = (performance.now() - start).toFixed(2);
      setExecTime(`${time}ms`);
      
      if (res.ok) {
        setQueryResult(data);
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        } else {
          setColumns([]);
        }
        addToast(`Executed successfully in ${time}ms`, 'SUCCESS');
      } else {
        addToast(data.error || 'Query failed', 'ERROR');
        setQueryResult([]);
        setColumns([]);
      }
    } catch (e) {
      console.error(e);
      addToast('Network error executing query', 'ERROR');
    }
  };

  const tables = ['users', 'attendance', 'attendance_sessions', 'projects', 'notes', 'badges', 'schedule', 'action_logs'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="text-primary" /> Core Data Nexus
          </h1>
          <p className="text-white/50">Direct SQL interface to the campus repository infrastructure</p>
        </div>
        <div className="flex gap-3">
           <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border-white/10">
             <Cpu className="text-accent" size={16} />
             <span className="text-xs font-bold uppercase tracking-widest text-white/40">Engine: SQLite 3.0</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        <aside className="glass-card p-6 space-y-6 overflow-y-auto">
           <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Table size={14} /> Schema Tables
              </h3>
              <div className="space-y-1">
                {tables.map(t => (
                  <button 
                    key={t}
                    onClick={() => { 
                      setActiveTable(t); 
                      const q = `SELECT * FROM ${t} LIMIT 10;`;
                      setQuery(q); 
                      executeQuery(q);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all border ${activeTable === t ? 'bg-primary/10 text-primary border-primary/20' : 'text-white/40 hover:text-white border-transparent hover:bg-white/5'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
           </div>

           <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <Lock size={16} className="text-red-400 shrink-0 mt-1" />
              <p className="text-[10px] text-red-400 leading-relaxed font-bold uppercase select-none">Read-Only access enforced for current session. Write operations require Admin-L2 biometric bypass.</p>
           </div>
        </aside>

        <div className="lg:col-span-3 flex flex-col gap-6">
           <div className="glass-card flex flex-col p-0 overflow-hidden bg-black/40">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <div className="flex items-center gap-3">
                   <TerminalIcon size={16} className="text-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">SQL Query Terminal</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => addToast('Buffer saved locally', 'SUCCESS')} className="p-2 glass rounded-lg text-white/20 hover:text-white"><Save size={14} /></button>
                    <button onClick={() => executeQuery()} className="p-2 glass rounded-lg text-white/20 hover:text-white"><RefreshCcw size={14} /></button>
                    <button onClick={() => executeQuery()} className="btn-primary py-1.5 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center gap-2">
                      Execute <Play size={10} fill="currentColor" />
                    </button>
                 </div>
              </div>
              <textarea 
                className="flex-1 bg-transparent p-6 text-sm font-mono text-primary outline-none resize-none min-h-[150px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
           </div>

           <div className="glass-card flex-1 p-0 overflow-hidden relative">
               <div className="p-4 border-b border-white/10 flex justify-between items-center">
                 <h3 className="font-bold text-xs uppercase tracking-widest text-white/40 italic">Result Buffer: {activeTable}</h3>
                 <span className="text-[10px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full tracking-tighter">Execution: {execTime}</span>
              </div>
              <div className="p-0 overflow-x-auto h-full max-h-[300px] scrollbar-hide">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 sticky top-0 backdrop-blur-md">
                        {activeTable === 'action_logs' ? (
                          <tr>
                            <th className="px-6 py-3 border-b border-white/5">id</th>
                            <th className="px-6 py-3 border-b border-white/5">user_id</th>
                            <th className="px-6 py-3 border-b border-white/5">action</th>
                            <th className="px-6 py-3 border-b border-white/5">path</th>
                            <th className="px-6 py-3 border-b border-white/5">timestamp</th>
                          </tr>
                        ) : (
                          <tr>
                            {columns.length > 0 ? columns.map(col => (
                              <th key={col} className="px-6 py-3 border-b border-white/5">{col}</th>
                            )) : <th className="px-6 py-3 border-b border-white/5">Result Area</th>}
                          </tr>
                        )}
                     </thead>
                     <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {activeTable === 'action_logs' ? (
                          <>{logs.length > 0 ? logs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white/40">{String(log.id).substring(0, 8)}...</td>
                              <td className="px-6 py-4 font-bold text-white/80">{log.user_id}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full border scale-90 inline-block font-sans font-bold ${log.action_type === 'POST' ? 'bg-primary/10 text-primary border-primary/20' : log.action_type === 'DELETE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-accent/10 text-accent border-accent/20'}`}>{log.action_type}</span>
                              </td>
                              <td className="px-6 py-4 text-white/60">{log.path}</td>
                              <td className="px-6 py-4 text-white/40">{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="px-6 py-4 text-white/40 text-center">No action logs recorded yet.</td></tr>
                          )}</>
                        ) : (
                          <>{queryResult.length > 0 ? queryResult.map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5">
                              {columns.map(col => (
                                <td key={`${idx}-${col}`} className="px-6 py-4 text-white/60">{String(row[col])}</td>
                              ))}
                            </tr>
                          )) : (
                             <tr><td colSpan={columns.length === 0 ? 1 : columns.length} className="px-6 py-4 text-center text-white/30">No results returned</td></tr>
                          )}</>
                        )}
                     </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExplorer;
