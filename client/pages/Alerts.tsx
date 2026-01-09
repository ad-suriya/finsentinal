
import React from 'react';
import Layout from '../components/Layout';
import TransactionTable from '../components/TransactionTable';
import { useTransactions } from '../context/TransactionContext';
import { AlertCircle, Filter } from 'lucide-react';

const Alerts: React.FC = () => {
  const { transactions } = useTransactions();
  const alerts = transactions.filter(tx => tx.status === 'FLAGGED' || tx.status === 'BLOCKED');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <AlertCircle className="text-amber-500" size={28} />
              Threat Center
            </h2>
            <p className="text-slate-400 text-sm mt-1">Reviewing {alerts.length} high-risk incidents requiring analyst intervention.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors">
              <Filter size={16} /> Filter
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-600/10">
              Bulk Action
            </button>
          </div>
        </header>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest block mb-1">Action Required</span>
              <span className="text-2xl font-bold text-white">{transactions.filter(t => t.status === 'FLAGGED').length}</span>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
              <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest block mb-1">Permanently Blocked</span>
              <span className="text-2xl font-bold text-white">{transactions.filter(t => t.status === 'BLOCKED').length}</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest block mb-1">False Positives Rate</span>
              <span className="text-2xl font-bold text-white">1.2%</span>
            </div>
          </div>
          <TransactionTable transactions={alerts} />
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;
