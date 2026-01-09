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
    } catch {
      return 'unknown time';
    }
  };

  return (
    <div className="w-full overflow-hidden bg-[#FFFFFF] border border-[#D1FAE5] rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#D1FAE5] bg-[#F0F7F4]">
              <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Hash ID
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#D1FAE5]">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => navigate(`/transaction/${tx.id}`)}
                className="cursor-pointer transition-colors hover:bg-[#F0F7F4] group"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-[#10B981] text-sm">
                    {tx.hashId}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-[#064E3B]">
                  {tx.entity}
                </td>

                <td className="px-6 py-4 text-sm text-[#64748B]">
                  {safeFormatDistance(tx.timestamp)}
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-[#064E3B] text-right">
                  ₹{tx.amount.toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={tx.status} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#D1FAE5] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          tx.score > 0.7
                            ? 'bg-[#EF4444]'
                            : tx.score > 0.3
                            ? 'bg-[#64748B]'
                            : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${tx.score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#64748B]">
                      {Math.round(tx.score * 100)}%
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <ArrowRight
                    className="inline text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-1 transition-all"
                    size={16}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="p-8 text-center text-[#64748B] text-sm">
          No transactions found.
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
