import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import KPICard from '../components/KPICard';
import TransactionTable from '../components/TransactionTable';
import { useTransactions } from '../context/TransactionContext';
import { getSecurityBriefing } from '../services/aiService';
import { 
  BarChart3, 
  ShieldX, 
  AlertCircle, 
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { transactions } = useTransactions();
  const [briefing, setBriefing] = useState<string>('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  const fetchBriefing = async () => {
    if (transactions.length === 0) return;
    setLoadingBriefing(true);
    try {
      const summary = await getSecurityBriefing(transactions);
      setBriefing(summary || '');
    } catch {
      setBriefing('Unable to reach VVFNT Intelligence Core.');
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [transactions.length > 0 && transactions.length % 10 === 0]);

  const totalVolume = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const blockedThreats = transactions.filter(tx => tx.status === 'BLOCKED').length;
  const activeAlerts = transactions.filter(tx => tx.status === 'FLAGGED').length;
  const avgRiskScore =
    transactions.length > 0
      ? (transactions.reduce((acc, tx) => acc + tx.score, 0) / transactions.length) * 100
      : 0;

  const latestTransactions = transactions.slice(0, 10);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[#064E3B] tracking-tight">
              Intelligence Dashboard
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              Operational overview of transaction security across all connected entities.
            </p>
          </div>

          <button
            onClick={fetchBriefing}
            className="flex items-center gap-2 text-xs font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1.5 rounded-lg hover:bg-[#10B981]/20 transition-colors"
          >
            <RefreshCw size={14} className={loadingBriefing ? 'animate-spin' : ''} />
            Refresh Intelligence
          </button>
        </header>

        {/* AI Briefing */}
        <div className="bg-[#F0F7F4] border border-[#D1FAE5] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={80} className="text-[#10B981]" />
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#064E3B] tracking-widest uppercase">
              Intelligence Briefing
            </h3>
          </div>

          <p className="text-[#64748B] text-sm italic leading-relaxed max-w-4xl">
            {loadingBriefing ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></span>
                Processing telemetry data...
              </span>
            ) : (
              briefing ||
              'No critical threats detected. System operating within normal parameters.'
            )}
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Volume"
            value={`₹${(totalVolume / 1000).toFixed(1)}K`}
            icon={BarChart3}
            trend="+12.5%"
          />
          <KPICard
            title="Blocked Threats"
            value={blockedThreats}
            icon={ShieldX}
            color="text-[#EF4444]"
          />
          <KPICard
            title="Active Alerts"
            value={activeAlerts}
            icon={AlertCircle}
            color="text-[#64748B]"
          />
          <KPICard
            title="Avg Risk Score"
            value={`${avgRiskScore.toFixed(0)}%`}
            icon={Activity}
          />
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#064E3B]">
              Live Transaction Stream
            </h3>

            <Link
              to="/alerts"
              className="text-[#10B981] hover:text-[#059669] text-sm font-medium flex items-center gap-1 group"
            >
              View All Alerts
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <TransactionTable transactions={latestTransactions} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
