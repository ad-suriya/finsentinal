
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, color = "text-primary" }) => {
  return (
    <div className="bg-surface border border-border p-5 rounded-xl flex flex-col gap-2 hover:border-muted transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-muted text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg bg-background border border-border ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-primary-text">{value}</span>
        {trend && (
          <span className="text-success text-xs font-medium mb-1">{trend}</span>
        )}
      </div>
    </div>
  );
};

export default KPICard;
