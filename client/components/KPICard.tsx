import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'text-[#10B981]'
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#D1FAE5] p-5 rounded-xl flex flex-col gap-2 transition-colors hover:border-[#10B981]">
      <div className="flex justify-between items-start">
        <span className="text-[#64748B] text-sm font-medium">
          {title}
        </span>

        <div className={`p-2 rounded-lg bg-[#F0F7F4] border border-[#D1FAE5] ${color}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#064E3B]">
          {value}
        </span>

        {trend && (
          <span className="text-[#10B981] text-xs font-medium mb-1">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPICard;
