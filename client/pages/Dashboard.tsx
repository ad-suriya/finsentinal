
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
    } catch (error) {
      setBriefing("Unable to reach VVFNT Intelligence Core.");
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [transactions.length > 0 && transactions.length % 10 === 0]); // Refresh briefing every 10 new txs

  // Metrics calculation
  const totalVolume = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const blockedThreats = transactions.filter(tx => tx.status === 'BLOCKED').length;
  const activeAlerts = transactions.filter(tx => tx.status === 'FLAGGED').length;
  const avgRiskScore = transactions.length > 0 
    ? (transactions.reduce((acc, tx) => acc + tx.score, 0) / transactions.length) * 100
    : 0;

  const latestTransactions = transactions.slice(0, 10);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary-text tracking-tight">Intelligence Dashboard</h2>
            <p className="text-muted text-sm mt-1">Operational overview of transaction security across all connected entities.</p>
          </div>
          <button 
            onClick={fetchBriefing}
            className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
          >
            <RefreshCw size={14} className={loadingBriefing ? 'animate-spin' : ''} />
            Refresh Intelligence
          </button>
        </header>

        {/* AI Briefing */}
        <div className="bg-gradient-to-r from-primary/10 to-surface border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={80} className="text-primary" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <h3 className="text-sm font-bold text-primary-text tracking-widest uppercase">Intelligence Briefing</h3>
          </div>
          <p className="text-secondary-text text-sm italic leading-relaxed max-w-4xl">
            {loadingBriefing ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                Processing telemetry data...
              </span>
            ) : briefing || "No critical threats detected. System operating within normal parameters."}
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
            color="text-critical"
          />
          <KPICard 
            title="Active Alerts" 
            value={activeAlerts} 
            icon={AlertCircle} 
            color="text-warning"
          />
          <KPICard 
            title="Avg Risk Score" 
            value={`${avgRiskScore.toFixed(0)}%`} 
            icon={Activity} 
          />
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary-text">Live Transaction Stream</h3>
            <Link to="/alerts" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 group">
              View All Alerts <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <TransactionTable transactions={latestTransactions} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
