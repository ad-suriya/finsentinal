import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTransactions } from '../context/TransactionContext';
import StatusBadge from '../components/StatusBadge';
import RiskGauge from '../components/RiskGauge';
import { getDeepAnalysis } from '../services/aiService';
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Building2,
  ShieldCheck,
  BrainCircuit,
  FileSearch,
  Hash,
  Terminal as TerminalIcon,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { transactions, updateTxStatus } = useTransactions();
  const navigate = useNavigate();
  const tx = transactions.find(t => t.id === id);

  const [deepAnalysis, setDeepAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!tx) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl text-muted font-bold">Transaction Not Found</h2>
          <Link to="/dashboard" className="text-primary mt-4 block underline">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await getDeepAnalysis(tx);
      setDeepAnalysis(result || '');
    } catch {
      setDeepAnalysis('Forensic link failed. Check Intelligence Core connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = async (newStatus: 'APPROVED' | 'BLOCKED') => {
    setIsUpdating(true);
    try {
      await updateTxStatus(tx.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-muted hover:text-primary transition text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex gap-3">
            <button
              disabled={isUpdating || tx.status === 'APPROVED'}
              onClick={() => handleStatusChange('APPROVED')}
              className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 text-success rounded-lg hover:bg-success/20 text-xs font-bold disabled:opacity-40"
            >
              <CheckCircle size={14} />
              Resolve as Legitimate
            </button>
            <button
              disabled={isUpdating || tx.status === 'BLOCKED'}
              onClick={() => handleStatusChange('BLOCKED')}
              className="flex items-center gap-2 px-4 py-2 bg-critical/10 border border-critical/20 text-critical rounded-lg hover:bg-critical/20 text-xs font-bold disabled:opacity-40"
            >
              <XCircle size={14} />
              Permanently Block
            </button>
          </div>
        </div>

        {/* Header Card */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface border border-border rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary">
              <Hash size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-mono font-bold text-primary-text uppercase">
                  {tx.hashId}
                </h2>
                <StatusBadge status={tx.status} />
              </div>
              <p className="text-muted text-xs font-mono">{tx.id}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-muted text-xs font-semibold uppercase block mb-1">
              Transaction Value
            </span>
            <span className="text-3xl font-bold text-primary-text">
              ₹{tx.amount.toLocaleString()}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <FileSearch size={14} /> Basic Data
              </h3>

              {[
                {
                  icon: Clock,
                  label: 'Timestamp',
                  value: format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm:ss')
                },
                { icon: Building2, label: 'Origin Entity', value: tx.entity },
                {
                  icon: CreditCard,
                  label: 'Payment Method',
                  value: 'Internal Ledger Transfer'
                },
                {
                  icon: ShieldCheck,
                  label: 'Verification Status',
                  value: 'Encrypted (SHA-256)',
                  highlight: true
                }
              ].map((row, i) => (
                <div key={i} className="flex gap-3">
                  <row.icon className="text-muted mt-1" size={16} />
                  <div>
                    <span className="text-xs text-muted block">{row.label}</span>
                    <span
                      className={`text-sm font-medium ${
                        row.highlight ? 'text-success' : 'text-secondary-text'
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleDeepAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2"
            >
              <Zap size={18} className={isAnalyzing ? 'animate-pulse' : ''} />
              {isAnalyzing ? 'Analyzing Patterns…' : 'Invoke Deep Analysis'}
            </button>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary-text flex items-center gap-3">
                  <BrainCircuit className="text-primary" size={22} />
                  AI Intelligence Report
                </h3>
                <span className="text-[10px] font-mono text-muted bg-background px-2 py-1 rounded">
                  MODEL: X-FRAUD-9
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RiskGauge score={tx.score} />
                <div className="bg-background border border-border rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold text-muted block mb-2">
                    Primary Risk Scenario
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      tx.score > 0.7
                        ? 'bg-critical/15 text-critical'
                        : 'bg-primary/15 text-primary'
                    }`}
                  >
                    {tx.scenario}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-muted">
                  Initial Reasoning
                </label>
                <div className="bg-background border-l-4 border-primary p-6 rounded-r-xl text-secondary-text italic">
                  “{tx.explanation}”
                </div>
              </div>

              {deepAnalysis && (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-primary flex items-center gap-2">
                    <TerminalIcon size={14} />
                    Forensic Deep Analysis
                  </label>
                  <pre className="bg-background border border-primary/30 rounded-xl p-6 text-xs text-primary-text font-mono whitespace-pre-wrap">
                    {deepAnalysis}
                  </pre>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                <span className="text-[10px] text-slate-600 uppercase font-bold self-center mr-2">Anomaly Tags:</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">#LATENCY_GAP</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">#NEW_DEVICE</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">#VPN_DETECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionDetail;
