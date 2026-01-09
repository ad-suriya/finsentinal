
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow, isValid } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const navigate = useNavigate();

  const safeFormatDistance = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (!isValid(date)) return 'unknown time';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'unknown time';
    }
  };

  return (
    <div className="w-full overflow-hidden bg-surface border border-border rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Hash ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Entity</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Score</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => (
              <tr 
                key={tx.id} 
                onClick={() => navigate(`/transaction/${tx.id}`)}
                className="hover:bg-border/50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-primary text-sm">{tx.hashId}</span>
                </td>
                <td className="px-6 py-4 text-sm text-secondary-text">
                  {tx.entity}
                </td>
                <td className="px-6 py-4 text-sm text-muted">
                  {safeFormatDistance(tx.timestamp)}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary-text text-right">
                  ₹{tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${tx.score > 0.7 ? 'bg-critical' : tx.score > 0.3 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${tx.score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted">{Math.round(tx.score * 100)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <ArrowRight className="inline text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <div className="p-8 text-center text-muted text-sm">
          No transactions found.
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
