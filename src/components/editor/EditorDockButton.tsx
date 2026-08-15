import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EditorDockButtonProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  count?: number;
  onClick: () => void;
  disabled?: boolean;
}

export const EditorDockButton: React.FC<EditorDockButtonProps> = ({
  label,
  icon: Icon,
  active = false,
  count,
  onClick,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    className={`inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/70 disabled:cursor-not-allowed disabled:opacity-35 ${
      active
        ? 'border-slate-950 bg-slate-950 text-white'
        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950'
    }`}
  >
    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    <span>{label}</span>
    {typeof count === 'number' && (
      <span className={`min-w-4 rounded px-1 text-center text-[9px] tabular-nums ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
    )}
  </button>
);
