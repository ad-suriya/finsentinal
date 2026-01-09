import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 1
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  const percentage = Math.round(score * 100);
  
  const getBarColor = () => {
    if (score < 0.3) return 'bg-[#10B981]';
    if (score < 0.7) return 'bg-[#64748B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-[#64748B]">
          Risk Assessment
        </span>

        <span
          className={`font-bold ${
            score >= 0.7
              ? 'text-[#EF4444]'
              : score >= 0.3
              ? 'text-[#64748B]'
              : 'text-[#10B981]'
          }`}
        >
          {percentage}%
        </span>
      </div>

      <div className="h-3 w-full bg-[#D1FAE5] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-[#64748B] pt-1 uppercase tracking-wider">
        <span>Low</span>
        <span>Moderate</span>
        <span>Critical</span>
      </div>
    </div>
  );
};

export default RiskGauge;
