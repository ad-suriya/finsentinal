
import React, { useState, useEffect } from 'react';
import { Activity, Terminal as TerminalIcon } from 'lucide-react';

const ApiMonitor: React.FC = () => {
  const [logs, setLogs] = useState<{ id: string; method: string; path: string; status: number }[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    let logCounter = 0;

    console.log = (...args) => {
      if (typeof args[0] === 'string' && args[0].startsWith('API CALL:')) {
        const parts = args[0].replace('API CALL: ', '').split(' ');
        logCounter++;
        setLogs(prev => [
          { 
            id: `${Date.now()}-${logCounter}`, 
            method: parts[0], 
            path: parts[1], 
            status: 200 
          }, 
          ...prev.slice(0, 4)
        ]);
      }
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/80">
      <div className="flex items-center gap-2 mb-3 text-slate-500">
        <Activity size={12} className="text-indigo-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Network Monitor</span>
      </div>
      <div className="space-y-1.5">
        {logs.map(log => (
          <div key={log.id} className="flex items-center justify-between font-mono text-[9px] text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-800/50 animate-in fade-in slide-in-from-left-2">
            <div className="flex gap-2">
              <span className="text-indigo-400 font-bold">{log.method}</span>
              <span className="truncate max-w-[80px]">{log.path}</span>
            </div>
            <span className="text-emerald-500">{log.status}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-[9px] text-slate-600 italic">Listening for traffic...</div>
        )}
      </div>
    </div>
  );
};

export default ApiMonitor;
