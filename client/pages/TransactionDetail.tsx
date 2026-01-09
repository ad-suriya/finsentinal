import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const tx = transactions.find(t => t.id === id);

  const [deepAnalysis, setDeepAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!tx) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-[#64748B]">Transaction Not Found</h2>
          <Link to="/dashboard" className="text-[#10B981] underline mt-4 block">
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = async (status: 'APPROVED' | 'BLOCKED') => {
    setIsUpdating(true);
    try {
      await updateTxStatus(tx.id, status);
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
            className="flex items-center gap-2 text-[#64748B] hover:text-[#10B981] text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex gap-3">
            <button
              disabled={isUpdating || tx.status === 'APPROVED'}
              onClick={() => handleStatusChange('APPROVED')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold
                         border border-[#D1FAE5]
                         bg-[#F0F7F4] text-[#10B981]
                         hover:bg-[#D1FAE5] disabled:opacity-40"
            >
              <CheckCircle size={14} />
              Resolve as Legitimate
            </button>

            <button
              disabled={isUpdating || tx.status === 'BLOCKED'}
              onClick={() => handleStatusChange('BLOCKED')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold
                         border border-[#EF4444]/30
                         bg-[#EF4444]/10 text-[#EF4444]
                         hover:bg-[#EF4444]/20 disabled:opacity-40"
            >
              <XCircle size={14} />
              Permanently Block
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between gap-6
                           bg-[#F0F7F4] border border-[#D1FAE5]
                           rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#D1FAE5] text-[#10B981]">
              <Hash size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-mono font-bold text-[#064E3B] uppercase">
                  {tx.hashId}
                </h2>
                <StatusBadge status={tx.status} />
              </div>
              <p className="text-xs font-mono text-[#64748B]">{tx.id}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-xs font-semibold text-[#64748B] uppercase mb-1">
              Transaction Value
            </span>
            <span className="text-3xl font-bold text-[#064E3B]">
              ₹{tx.amount.toLocaleString()}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-[#D1FAE5] rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <FileSearch size={14} /> Basic Data
              </h3>

              {[
                { icon: Clock, label: 'Timestamp', value: format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm:ss') },
                { icon: Building2, label: 'Origin Entity', value: tx.entity },
                { icon: CreditCard, label: 'Payment Method', value: 'Internal Ledger Transfer' },
                { icon: ShieldCheck, label: 'Verification Status', value: 'Encrypted (SHA-256)', highlight: true }
              ].map((row, i) => (
                <div key={i} className="flex gap-3">
                  <row.icon size={16} className="text-[#64748B] mt-1" />
                  <div>
                    <span className="block text-xs text-[#64748B]">{row.label}</span>
                    <span className={`text-sm font-medium ${row.highlight ? 'text-[#10B981]' : 'text-[#064E3B]'}`}>
                      {row.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleDeepAnalysis}
              disabled={isAnalyzing}
              className="w-full py-4 rounded-2xl font-bold text-white
                         bg-[#10B981] hover:bg-[#059669]
                         transition flex items-center justify-center gap-2"
            >
              <Zap size={18} className={isAnalyzing ? 'animate-pulse' : ''} />
              {isAnalyzing ? 'Analyzing Patterns…' : 'Invoke Deep Analysis'}
            </button>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#D1FAE5] rounded-2xl p-8 space-y-8">

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#064E3B] flex items-center gap-3">
                  <BrainCircuit className="text-[#10B981]" size={22} />
                  AI Intelligence Report
                </h3>
                <span className="text-[10px] font-mono text-[#64748B] bg-[#F0F7F4] px-2 py-1 rounded">
                  MODEL: X-FRAUD-9
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <RiskGauge score={tx.score} />
                <div className="bg-[#F0F7F4] border border-[#D1FAE5] rounded-xl p-4">
                  <span className="block mb-2 text-[10px] uppercase font-bold text-[#64748B]">
                    Primary Risk Scenario
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold
                    ${tx.score > 0.7 ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#10B981]/15 text-[#10B981]'}`}>
                    {tx.scenario}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#64748B]">
                  Initial Reasoning
                </label>
                <div className="bg-[#F0F7F4] border-l-4 border-[#10B981] p-6 rounded-r-xl italic text-[#064E3B]">
                  “{tx.explanation}”
                </div>
              </div>

              {deepAnalysis && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#10B981]">
                    <TerminalIcon size={14} />
                    Forensic Deep Analysis
                  </label>
                  <pre className="bg-[#F0F7F4] border border-[#10B981]/30 rounded-xl p-6
                                  text-xs font-mono text-[#064E3B] whitespace-pre-wrap">
                    {deepAnalysis}
                  </pre>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionDetail;
