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
    } catch {
      return '--:--:--';
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        'WARNING: This will wipe all transaction data and restore default mock data. Continue?'
      )
    ) {
      setIsResetting(true);
      await resetDatabase();
      setIsResetting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h2 className="text-2xl font-bold text-primary-text tracking-tight">
            Traffic Simulator
          </h2>
          <p className="text-muted text-sm mt-1">
            Stress test AI detection models by simulating live transaction traffic.
          </p>
        </header>

        {/* Control Panel */}
        <div className="bg-surface border border-border rounded-2xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary">
              <Activity size={22} />
              <h3 className="text-lg font-bold text-primary-text">
                Simulation Core
              </h3>
            </div>

            <button
              onClick={handleReset}
              disabled={isResetting || simulationActive}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold
                text-muted hover:text-critical hover:bg-critical/10
                border border-transparent hover:border-critical/20
                transition disabled:opacity-40"
            >
              <RefreshCcw
                size={12}
                className={isResetting ? 'animate-spin' : ''}
              />
              {isResetting ? 'RESETTING DB…' : 'FACTORY RESET DB'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Normal Traffic */}
            <button
              onClick={startNormalTraffic}
              disabled={simulationActive || isResetting}
              className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition group
                ${
                  simulationActive
                    ? 'bg-background border-border opacity-50 cursor-not-allowed'
                    : 'bg-success/5 border-success/20 hover:border-success/40'
                }`}
            >
              <div
                className={`p-4 rounded-full bg-success text-white shadow-lg shadow-success/20
                  ${
                    !simulationActive &&
                    'group-hover:scale-110 transition-transform'
                  }`}
              >
                <Play size={24} fill="currentColor" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-primary-text">
                  Normal Traffic
                </span>
                <span className="text-xs text-muted">
                  Add 1 APPROVED / 3s
                </span>
              </div>
            </button>

            {/* Fraud Burst */}
            <button
              onClick={startFraudBurst}
              disabled={isResetting}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl border
                bg-critical/5 border-critical/20 hover:border-critical/40
                transition group disabled:opacity-50"
            >
              <div className="p-4 rounded-full bg-critical text-white shadow-lg shadow-critical/20 group-hover:scale-110 transition-transform">
                <Zap size={24} fill="currentColor" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-primary-text">
                  Fraud Burst
                </span>
                <span className="text-xs text-muted">
                  Inject 3 BLOCKED instantly
                </span>
              </div>
            </button>

            {/* Emergency Stop */}
            <button
              onClick={stopSimulation}
              disabled={!simulationActive || isResetting}
              className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition group
                ${
                  !simulationActive
                    ? 'bg-background border-border opacity-50 cursor-not-allowed'
                    : 'bg-surface border-border hover:border-muted'
                }`}
            >
              <div
                className={`p-4 rounded-full bg-muted text-primary-text
                  ${
                    simulationActive &&
                    'group-hover:scale-110 transition-transform'
                  }`}
              >
                <Square size={24} fill="currentColor" />
              </div>
              <div className="text-center">
                <span className="block font-bold text-primary-text">
                  Emergency Stop
                </span>
                <span className="text-xs text-muted">
                  Clear all intervals
                </span>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="flex gap-3 bg-background border border-border rounded-xl p-4">
            <Info className="text-primary shrink-0" size={18} />
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-bold uppercase text-secondary-text">
                Pro Tip:
              </span>{' '}
              Use <strong>Fraud Burst</strong> to observe real-time KPI updates.
              Use <strong>Factory Reset DB</strong> to restore initial mock data
              with fresh timestamps.
            </p>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
            <h3 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <History size={16} />
              Event Log (Latest 20)
            </h3>
            {simulationActive && (
              <span className="text-[10px] text-success font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                POLLING_ACTIVE
              </span>
            )}
          </div>

          <div className="p-4 h-[400px] overflow-y-auto font-mono text-[11px] space-y-2">
            {simulationLog.map(tx => (
              <div
                key={tx.id}
                className="flex gap-4 border-b border-border/40 pb-2 last:border-0
                  hover:bg-border/30 px-2 py-1 transition"
              >
                <span className="text-muted">
                  [{safeFormatTime(tx.timestamp)}]
                </span>
                <span className="text-primary">{tx.hashId}</span>
                <span className="text-secondary-text flex-1">
                  {tx.entity} Transaction
                </span>
                <span className="text-primary-text">
                  ₹{tx.amount.toLocaleString()}
                </span>
                <span
                  className={
                    tx.status === 'APPROVED'
                      ? 'text-success'
                      : tx.status === 'FLAGGED'
                      ? 'text-warning'
                      : 'text-critical'
                  }
                >
                  {tx.status}
                </span>
              </div>
            ))}

            {simulationLog.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted">
                Log empty. Start a simulation to generate events.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Simulation;
