import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputFieldProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-2.5 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400 font-mono shadow-inner ${
          error ? 'border-rose-450 focus:border-rose-450 focus:ring-rose-450' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] text-rose-500 font-mono">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`px-2.5 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400 font-mono shadow-inner ${
          error ? 'border-rose-450 focus:border-rose-450 focus:ring-rose-450' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-rose-500 font-mono">{error}</span>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`px-2.5 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400 font-sans shadow-inner ${
          error ? 'border-rose-450 focus:border-rose-450 focus:ring-rose-450' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] text-rose-500 font-mono">{error}</span>}
    </div>
  );
};
