import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = <HelpCircle className="w-8 h-8 text-slate-350" />
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-lg bg-white/50 max-w-md mx-auto my-6">
      <div className="mb-3 text-slate-400 p-3 bg-slate-50 rounded-full border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};
