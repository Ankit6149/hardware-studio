'use client';

import React from 'react';
import { X } from 'lucide-react';

interface EngineeringEditorBarProps {
  domain: string;
  title: string;
  meta?: React.ReactNode;
  tools?: React.ReactNode;
  docks?: React.ReactNode;
  actions?: React.ReactNode;
}

export const EngineeringEditorBar: React.FC<EngineeringEditorBarProps> = ({
  domain,
  title,
  meta,
  tools,
  docks,
  actions,
}) => (
  <header className="flex min-h-12 shrink-0 items-center gap-2 border-b border-[#cbc7bd] bg-[#f8f6f0] px-2.5 py-1.5 shadow-[0_1px_0_rgba(17,17,15,0.03)]" data-editor-chrome="command-bar">
    <div className="min-w-[10.5rem] max-w-[17rem] border-r border-[#d8d4ca] pr-3">
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-500">{domain}</span>
        <span className="text-[10px] text-slate-300">/</span>
        <span className="truncate text-[12px] font-semibold tracking-[-0.01em] text-slate-950">{title}</span>
      </div>
      {meta && <div className="mt-0.5 truncate text-[10px] leading-4 text-slate-500">{meta}</div>}
    </div>

    {tools && (
      <div className="flex min-w-0 items-center gap-px border border-[#d8d4ca] bg-[#ebe8e0] p-px" aria-label={`${domain} editor tools`}>
        {tools}
      </div>
    )}
    <div className="min-w-0 flex-1" />
    {docks && <div className="flex shrink-0 items-center gap-1 border-r border-[#d8d4ca] pr-2">{docks}</div>}
    {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
  </header>
);

interface EngineeringStatusBarProps {
  left: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export const EngineeringStatusBar: React.FC<EngineeringStatusBarProps> = ({ left, center, right }) => (
  <footer className="flex min-h-7 shrink-0 items-center gap-3 border-t border-[#272622] bg-[#1b1a18] px-3 text-[10px] text-[#d1cdc3]" data-editor-chrome="status-bar">
    <div className="min-w-0 truncate">{left}</div>
    {center && <div className="min-w-0 flex-1 truncate text-center text-[#9f9a90]">{center}</div>}
    {right && <div className="ml-auto shrink-0 font-mono tabular-nums text-[#e8e4da]">{right}</div>}
  </footer>
);

interface EngineeringDockProps {
  side: 'left' | 'right';
  title: string;
  subtitle?: string;
  onClose: () => void;
  widthClassName?: string;
  children: React.ReactNode;
}

export const EngineeringDock: React.FC<EngineeringDockProps> = ({
  side,
  title,
  subtitle,
  onClose,
  widthClassName = 'w-[292px]',
  children,
}) => (
  <aside
    className={`absolute bottom-0 top-0 z-30 flex ${widthClassName} flex-col overflow-hidden bg-[#fbfaf6] shadow-[0_12px_32px_rgba(17,17,15,0.10)] ${side === 'left' ? 'left-0 border-r border-[#c9c5bb]' : 'right-0 border-l border-[#c9c5bb]'}`}
    data-editor-chrome={`${side}-dock`}
  >
    <div className="flex min-h-11 shrink-0 items-center justify-between gap-2 border-b border-[#d8d4ca] bg-[#f0eee7] px-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold tracking-[-0.01em] text-slate-950">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-[9px] leading-3 text-slate-500">{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center text-slate-500 hover:bg-[#dedbd2] hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400" aria-label={`Close ${title}`}>
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
    <div className="min-h-0 flex-1 overflow-auto">{children}</div>
  </aside>
);

export const EditorToolButton: React.FC<{
  label: string;
  shortcut?: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, shortcut, hint, active = false, disabled = false, onClick, children }) => {
  const tooltip = [label, shortcut ? `(${shortcut})` : '', hint ? `— ${hint}` : ''].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={tooltip}
      className={`group inline-flex h-8 items-center gap-1.5 px-2.5 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-30 ${active ? 'bg-slate-950 text-white' : 'bg-[#f8f6f0] text-slate-650 hover:bg-white hover:text-slate-950'}`}
    >
      <span className="grid h-4 w-4 place-items-center" aria-hidden="true">{children}</span>
      <span className="hidden xl:inline">{label}</span>
      {shortcut && <span className={`hidden 2xl:inline font-mono text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{shortcut}</span>}
    </button>
  );
};
