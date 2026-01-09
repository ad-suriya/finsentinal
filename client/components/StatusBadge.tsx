
import React from 'react';
import { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    APPROVED: "text-success bg-success/10 border-success/20",
    FLAGGED: "text-warning bg-warning/10 border-warning/20",
    BLOCKED: "text-critical bg-critical/10 border-critical/20",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
