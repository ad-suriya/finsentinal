
import React, { useState, useEffect } from 'react';
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
  
  const [deepAnalysis, setDeepAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!tx) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl text-slate-500 font-bold">Transaction Not Found</h2>
          <Link to="/dashboard" className="text-indigo-400 mt-4 block underline">Return to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await getDeepAnalysis(tx);
      setDeepAnalysis(result || '');
    } catch (error) {
      setDeepAnalysis("Forensic link failed. Check Intelligence Core connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = async (newStatus: "APPROVED" | "BLOCKED") => {
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
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium w-fit">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          
          <div className="flex gap-3">
            <button 
              disabled={isUpdating || tx.status === 'APPROVED'}
              onClick={() => handleStatusChange('APPROVED')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all text-xs font-bold disabled:opacity-30"
            >
              <CheckCircle size={14} /> Resolve as Legitimate
            </button>
            <button 
              disabled={isUpdating || tx.status === 'BLOCKED'}
              onClick={() => handleStatusChange('BLOCKED')}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all text-xs font-bold disabled:opacity-30"
            >
              <XCircle size={14} /> Permanently Block
            </button>
          </div>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/30 p-8 border border-slate-800 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl text-indigo-400">
              <Hash size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-tight">{tx.hashId}</h2>
                <StatusBadge status={tx.status} />
              </div>
              <p className="text-slate-500 text-sm font-mono">{tx.id}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest block mb-1">Transaction Value</span>
            <span className="text-4xl font-bold text-white">₹{tx.amount.toLocaleString()}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Raw Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileSearch size={14} /> Basic Data
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="text-slate-500 mt-1" size={18} />
                  <div>
                    <span className="text-xs text-slate-500 block">Timestamp</span>
                    <span className="text-sm text-slate-200 font-medium">
                      {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="text-slate-500 mt-1" size={18} />
                  <div>
                    <span className="text-xs text-slate-500 block">Origin Entity</span>
                    <span className="text-sm text-slate-200 font-medium">{tx.entity}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="text-slate-500 mt-1" size={18} />
                  <div>
                    <span className="text-xs text-slate-500 block">Payment Method</span>
                    <span className="text-sm text-slate-200 font-medium">Internal Ledger Transfer</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-slate-500 mt-1" size={18} />
                  <div>
                    <span className="text-xs text-slate-500 block">Verification Status</span>
                    <span className="text-sm text-emerald-500 font-medium">Encrypted (SHA-256)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleDeepAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Zap size={18} className={isAnalyzing ? 'animate-pulse' : ''} />
              {isAnalyzing ? 'Analyzing Patterns...' : 'Invoke Deep Analysis'}
            </button>
          </div>

          {/* Right Panel: AI & Logic */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-8">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <BrainCircuit className="text-indigo-400" size={24} /> 
                  VVFNT AI Intelligence Report
                </h3>
                <div className="bg-slate-800 px-3 py-1 rounded text-[10px] text-slate-400 font-mono">MODEL: X-FRAUD-9</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <RiskGauge score={tx.score} />
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Primary Risk Scenario</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${tx.score > 0.7 ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      {tx.scenario}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Initial Reasoning</label>
                <div className="bg-slate-950/80 p-6 border-l-4 border-indigo-500 rounded-r-xl text-slate-300 leading-relaxed italic font-medium">
                  "{tx.explanation}"
                </div>
              </div>

              {deepAnalysis && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest flex items-center gap-2">
                    <TerminalIcon size={14} /> Forensic Deep Analysis Output
                  </label>
                  <div className="bg-slate-950 p-6 border border-indigo-500/30 rounded-xl text-indigo-100 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {deepAnalysis}
                  </div>
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
