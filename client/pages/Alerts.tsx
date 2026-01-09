import React from 'react';
import Layout from '../components/Layout';
import TransactionTable from '../components/TransactionTable';
import { useTransactions } from '../context/TransactionContext';
import { AlertCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

const Alerts: React.FC = () => {
  const { transactions } = useTransactions();
  const alerts = transactions.filter(
    tx => tx.status === 'FLAGGED' || tx.status === 'BLOCKED'
  );

  return (
    <Layout>
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.header
          variants={item}
          className="flex justify-between items-end"
        >
          <div>
            <h2 className="text-2xl font-semibold text-slate-100 tracking-tight flex items-center gap-3">
              <AlertCircle className="text-slate-300" size={26} />
              Alert Review
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {alerts.length} transactions pending risk assessment.
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700 transition"
            >
              <Filter size={16} /> Filter
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="bg-slate-200 hover:bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-md transition shadow-sm"
            >
              Bulk Action
            </motion.button>
          </div>
        </motion.header>

        <motion.div className="space-y-4" variants={item}>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              {
                label: 'Flagged',
                value: transactions.filter(t => t.status === 'FLAGGED').length
              },
              {
                label: 'Blocked',
                value: transactions.filter(t => t.status === 'BLOCKED').length
              },
              {
                label: 'False Positive Rate',
                value: '1.2%'
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -2 }}
                className="bg-slate-800 border border-slate-700 p-4 rounded-lg"
              >
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide block mb-1">
                  {card.label}
                </span>
                <span className="text-2xl font-semibold text-slate-100">
                  {card.value}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div variants={item}>
            <TransactionTable transactions={alerts} />
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Alerts;
