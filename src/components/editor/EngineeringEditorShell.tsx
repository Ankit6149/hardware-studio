'use client';

import React from 'react';

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
  <header className="flex min-h-11 shrink-0 items-center gap-2 border-b border-slate-300 bg-white px-2.5 py-1.5" data-editor-chrome="command-bar">
    <div className="min-w-[9rem] max-w-[15rem] border-r border-slate-200 pr-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{domain}</span>
        <span className="text-[9px] text-slate-300">/</span>
        <span className="truncate text-[11px] font-semibold text-slate-900">{title}</span>
      </div>
      {meta && <div className="mt-0.5 truncate text-[9px] text-slate-500">{meta}</div>}
    </div>

    {tools && <div className="flex min-w-0 items-center gap-0.5" aria-label={`${domain} editor tools`}>{tools}</div>}
    <div className="min-w-0 flex-1" />
    {docks && <div className="flex shrink-0 items-center gap-1">{docks}</div>}
    {actions && <div className="flex shrink-0 items-center gap-1 border-l border-slate-200 pl-2">{actions}</div>}
  </header>
);

interface EngineeringStatusBarProps {
  left: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export const EngineeringStatusBar: React.FC<EngineeringStatusBarProps> = ({ left, center, right }) => (
  <footer className="flex min-h-6 shrink-0 items-center gap-3 border-t border-slate-300 bg-[#eeece5] px-2.5 text-[9px] text-slate-600" data-editor-chrome="status-bar">
    <div className="min-w-0 truncate">{left}</div>
    {center && <div className="min-w-0 flex-1 truncate text-center text-slate-500">{center}</div>}
    {right && <div className="ml-auto shrink-0 font-mono tabular-nums text-slate-700">{right}</div>}
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
  widthClassName = 'w-[280px]',
  children,
}) => (
  <aside
    className={`absolute bottom-2 top-2 z-30 flex ${widthClassName} flex-col overflow-hidden border border-slate-300 bg-[#fbfaf6] shadow-[0_10px_28px_rgba(17,17,15,0.12)] ${side === 'left' ? 'left-2' : 'right-2'}`}
    data-editor-chrome={`${side}-dock`}
  >
    <div className="flex min-h-10 shrink-0 items-start justify-between gap-2 border-b border-slate-300 bg-[#f1efe8] px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-slate-900">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-[9px] text-slate-500">{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose} className="grid h-6 w-6 shrink-0 place-items-center text-sm text-slate-500 hover:bg-slate-200 hover:text-slate-900" aria-label={`Close ${title}`}>×</button>
    </div>
    <div className="min-h-0 flex-1 overflow-auto">{children}</div>
  </aside>
);

export const EditorToolButton: React.FC<{
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, active = false, disabled = false, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    title={label}
    className={`inline-flex h-8 items-center gap-1.5 px-2 text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-30 ${active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
  >
    {children}
    <span className="hidden 2xl:inline">{label}</span>
  </button>
);
