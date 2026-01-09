
import React from 'react';
import { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    APPROVED: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20',
    FLAGGED: 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/20',
    BLOCKED: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
