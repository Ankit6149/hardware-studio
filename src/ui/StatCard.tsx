import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  status?: 'success' | 'warning' | 'info' | 'error' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtext,
  status = 'neutral',
  icon
}) => {
  const statusColors = {
    success: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
    info: 'border-l-4 border-l-blue-500',
    error: 'border-l-4 border-l-rose-500',
    neutral: 'border-l-4 border-l-slate-400'
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-start justify-between min-w-[150px] ${statusColors[status]}`}>
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
          {title}
        </span>
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-bold font-mono tracking-tight text-slate-800">
            {value}
          </span>
          {unit && (
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              {unit}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-[10px] text-slate-450 leading-none">
            {subtext}
          </p>
        )}
      </div>
      {icon && <div className="text-slate-350 shrink-0 ml-2">{icon}</div>}
    </div>
  );
};
