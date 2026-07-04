import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-mono font-medium rounded transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-slate-400 select-none";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-emerald-700/50",
    secondary: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm",
    outline: "bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-700/50",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
  };

  const sizes = {
    xs: "px-2 py-1 text-[10px] space-x-1",
    sm: "px-2.5 py-1.5 text-xs space-x-1.5",
    md: "px-4 py-2 text-xs space-x-2",
    lg: "px-5 py-2.5 text-sm space-x-2"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
