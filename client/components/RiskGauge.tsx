
import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 1
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  const percentage = Math.round(score * 100);
  
  const getBarColor = () => {
    if (score < 0.3) return "bg-success";
    if (score < 0.7) return "bg-warning";
    return "bg-critical";
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted">Risk Assessment</span>
        <span className={`font-bold ${score >= 0.7 ? 'text-critical' : score >= 0.3 ? 'text-warning' : 'text-success'}`}>
          {percentage}%
        </span>
      </div>
      <div className="h-3 w-full bg-border rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted pt-1">
        <span>LOW</span>
        <span>MODERATE</span>
        <span>CRITICAL</span>
      </div>
    </div>
  );
};

export default RiskGauge;
