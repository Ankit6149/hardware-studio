import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'error' | 'neutral' | 'accent' | 'primary';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono select-none";
  
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/50",
    info: "bg-blue-50 text-blue-700 border border-blue-200/50",
    error: "bg-rose-50 text-rose-700 border border-rose-200/50",
    primary: "bg-cyan-50 text-cyan-700 border border-cyan-200/50",
    accent: "bg-purple-50 text-purple-700 border border-purple-200/50",
    neutral: "bg-slate-50 text-slate-600 border border-slate-200/50"
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
