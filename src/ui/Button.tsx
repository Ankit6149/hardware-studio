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
  const baseStyle = 'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45 focus:outline-none focus:ring-2 focus:ring-slate-500/60 focus:ring-offset-1 select-none';

  const variants = {
    primary: 'border border-slate-950 bg-slate-950 text-white hover:bg-slate-800',
    secondary: 'border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-100',
    outline: 'border border-slate-300 bg-transparent text-slate-700 hover:border-slate-500 hover:bg-slate-100',
    danger: 'border border-rose-700 bg-rose-700 text-white hover:bg-rose-800',
    ghost: 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950',
  };

  const sizes = {
    xs: 'min-h-8 px-2 text-[11px]',
    sm: 'min-h-9 px-2.5 text-[11px]',
    md: 'min-h-10 px-3 text-xs',
    lg: 'min-h-10 px-4 text-sm',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
