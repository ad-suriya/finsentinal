
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTransactions } from '../context/TransactionContext';
import { 
  Play, 
  Zap, 
  Square, 
  Activity,
  History,
  Info,
  RefreshCcw
} from 'lucide-react';
import { format, isValid } from 'date-fns';

const Simulation: React.FC = () => {
  const { 
    transactions, 
    startNormalTraffic, 
    startFraudBurst, 
    stopSimulation,
    resetDatabase,
    simulationActive
  } = useTransactions();

  const [isResetting, setIsResetting] = useState(false);
  const simulationLog = transactions.slice(0, 20);

  const safeFormatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (!isValid(date)) return '--:--:--';
      return format(date, 'HH:mm:ss');
    } catch (e) {
      return '--:--:--';
    }
  };

  const handleReset = async () => {
    if (window.confirm("WARNING: This will wipe all current transaction data from the database and restore default mock data. Continue?")) {
      setIsResetting(true);
      await resetDatabase();
      setIsResetting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h2 className="text-2xl font-bold text-white tracking-tight">Traffic Simulator</h2>
          <p className="text-slate-400 text-sm mt-1">Stress test the AI detection models by simulating various traffic conditions.</p>
        </header>

        {/* Controls */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-indigo-400">
              <Activity size={24} />
              <h3 className="text-lg font-bold text-white">Simulation Core</h3>
            </div>
            
            <button 
              onClick={handleReset}
              disabled={isResetting || simulationActive}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-30"
            >
              <RefreshCcw size={12} className={isResetting ? 'animate-spin' : ''} />
              {isResetting ? 'RESETTING DB...' : 'FACTORY RESET DB'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={startNormalTraffic}
              disabled={simulationActive || isResetting}
              className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all group ${
                simulationActive 
                ? 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed' 
                : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <div className={`p-4 rounded-full bg-emerald-500 text-white ${!simulationActive && 'group-hover:scale-110'} transition-transform shadow-lg shadow-emerald-500/20`}>
                <Play size={24} fill="currentColor" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-white">Normal Traffic</span>
                <span className="text-xs text-slate-500">Add 1 APPROVED / 3s</span>
              </div>
            </button>

            <button 
              onClick={startFraudBurst}
              disabled={isResetting}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl border bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 transition-all group disabled:opacity-50"
            >
              <div className="p-4 rounded-full bg-rose-500 text-white group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                <Zap size={24} fill="currentColor" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-white">Fraud Burst</span>
                <span className="text-xs text-slate-500">Inject 3 BLOCKED Instantly</span>
              </div>
            </button>

            <button 
              onClick={stopSimulation}
              disabled={!simulationActive || isResetting}
              className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all group ${
                !simulationActive 
                ? 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed' 
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className={`p-4 rounded-full bg-slate-600 text-white ${simulationActive && 'group-hover:scale-110'} transition-transform`}>
                <Square size={24} fill="currentColor" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-white">Emergency Stop</span>
                <span className="text-xs text-slate-500">Clear All Intervals</span>
              </div>
            </button>
          </div>

          <div className="mt-8 flex items-start gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Info className="text-indigo-400 shrink-0" size={18} />
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-400 uppercase">Pro-Tip:</span> Use the Fraud Burst to see real-time KPI updates. Use 'Factory Reset DB' to clear all data and restore the initial 5 mock records with fresh timestamps.
            </p>
          </div>
        </div>

        {/* Real-time Log */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <History size={16} /> Event Log (Latest 20)
            </h3>
            {simulationActive && (
              <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                POLLING_ACTIVE
              </span>
            )}
          </div>
          <div className="p-4 h-[400px] overflow-y-auto font-mono text-[11px] space-y-2">
            {simulationLog.map((tx) => (
              <div key={tx.id} className="flex gap-4 border-b border-slate-800/50 pb-2 last:border-0 hover:bg-slate-800/20 px-2 py-1 transition-colors">
                <span className="text-slate-600">[{safeFormatTime(tx.timestamp)}]</span>
                <span className="text-indigo-400">{tx.hashId}</span>
                <span className="text-slate-400 flex-1">{tx.entity} Transaction</span>
                <span className="text-white">₹{tx.amount.toLocaleString()}</span>
                <span className={tx.status === 'APPROVED' ? 'text-emerald-500' : tx.status === 'FLAGGED' ? 'text-amber-500' : 'text-rose-500'}>
                  {tx.status}
                </span>
              </div>
            ))}
            {simulationLog.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-600">
                Log currently empty. Start simulation to see events.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Simulation;
