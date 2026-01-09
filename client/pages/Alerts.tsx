import React, { useState } from 'react';
import Layout from '../components/Layout';
import TransactionTable from '../components/TransactionTable';
import { useTransactions } from '../context/TransactionContext';
import { AlertCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

type StatusFilter = 'ALL' | 'APPROVED' | 'FLAGGED' | 'BLOCKED';

const Alerts: React.FC = () => {
  const { transactions, updateTxStatus } = useTransactions();

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const alerts = transactions.filter(tx => {
    if (statusFilter === 'ALL') return true;
    return tx.status === statusFilter;
  });

  const handleBulkApprove = async () => {
    const targets = alerts.filter(tx => tx.status === 'FLAGGED');
    await Promise.all(targets.map(tx => updateTxStatus(tx.id, 'APPROVED')));
  };

  return (
    <Layout>
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header variants={item} className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#064E3B] tracking-tight flex items-center gap-3">
              <AlertCircle className="text-[#64748B]" size={26} />
              Alert Review
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              {alerts.length} transactions matching current filter.
            </p>
          </div>

          <div className="relative flex gap-3">
            {/* Filter Button */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 bg-[#F0F7F4] border border-[#D1FAE5]
                         px-4 py-2 rounded-md text-sm text-[#064E3B]
                         hover:bg-[#E6F4EF] transition"
            >
              <Filter size={16} />
              Filter
            </motion.button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div className="absolute right-32 top-12 w-48 bg-white border border-[#D1FAE5]
                              rounded-lg shadow-sm z-10">
                {[
                  { label: 'All Transactions', value: 'ALL' },
                  { label: 'Approved', value: 'APPROVED' },
                  { label: 'Under Review', value: 'FLAGGED' },
                  { label: 'Blocked', value: 'BLOCKED' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value as StatusFilter);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition
                      ${
                        statusFilter === option.value
                          ? 'bg-[#F0F7F4] text-[#064E3B] font-semibold'
                          : 'text-[#64748B] hover:bg-[#F0F7F4]'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Bulk Action */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBulkApprove}
              className="bg-[#10B981] hover:bg-[#059669]
                         text-white text-sm font-semibold
                         px-4 py-2 rounded-md transition"
            >
              Bulk Approve
            </motion.button>
          </div>
        </motion.header>

        {/* Body */}
        <motion.div className="space-y-4" variants={item}>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {[
              { label: 'Flagged', value: transactions.filter(t => t.status === 'FLAGGED').length },
              { label: 'Blocked', value: transactions.filter(t => t.status === 'BLOCKED').length },
              { label: 'False Positive Rate', value: '1.2%' }
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -2 }}
                className="bg-[#FFFFFF] border border-[#D1FAE5] p-4 rounded-lg"
              >
                <span className="text-xs font-semibold text-[#64748B] uppercase block mb-1">
                  {card.label}
                </span>
                <span className="text-2xl font-bold text-[#064E3B]">
                  {card.value}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <motion.div variants={item}>
            <TransactionTable transactions={alerts} />
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Alerts;
