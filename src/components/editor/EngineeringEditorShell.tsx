'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import {
  ElectronicsRepresentationStrip,
  type ElectronicsRepresentation,
} from '../electronics/ElectronicsRepresentationStrip';

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
  <header className="flex min-h-[52px] shrink-0 items-center gap-2 border-b border-[#c8c3b8] bg-[#f8f6f0] px-2.5 py-1.5" data-editor-chrome="command-bar">
    <div className="min-w-[11.5rem] max-w-[18rem] border-r border-[#d8d4ca] pr-3">
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{domain}</span>
        <span className="text-[9px] text-slate-300">/</span>
        <span className="truncate text-[13px] font-semibold tracking-[-0.018em] text-slate-950">{title}</span>
      </div>
      {meta && <div className="mt-0.5 truncate text-[9px] leading-4 text-slate-500">{meta}</div>}
    </div>

    {tools && (
      <div className="flex min-w-0 items-center gap-px overflow-x-auto border border-[#d8d4ca] bg-[#ebe8e0] p-px" aria-label={`${domain} editor tools`}>
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
  chromeId?: string;
}

export const EngineeringDock: React.FC<EngineeringDockProps> = ({
  side,
  title,
  subtitle,
  onClose,
  widthClassName = 'w-[292px]',
  children,
  chromeId,
}) => (
  <aside
    className={`absolute bottom-0 top-0 z-30 flex ${widthClassName} flex-col overflow-hidden bg-[#fbfaf6] shadow-[0_12px_32px_rgba(17,17,15,0.10)] ${side === 'left' ? 'left-0 border-r border-[#c9c5bb]' : 'right-0 border-l border-[#c9c5bb]'}`}
    data-editor-chrome={chromeId || `${side}-dock`}
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

interface EngineeringInspectorProps {
  open: boolean;
  subtitle?: string;
  onClose: () => void;
  widthClassName?: string;
  children: React.ReactNode;
}

const inspectorRepresentationByView: Readonly<Record<string, ElectronicsRepresentation | undefined>> = {
  'schematic-editor': 'schematic',
  'board-designer': 'pcb',
};

/**
 * Shared right-side selection surface. The workbench owns whether it is open and
 * what the current canonical selection means; the Inspector owns framing plus a
 * compact cross-representation header when the immediate Electronics selection
 * is attached to a canonical component.
 */
export const EngineeringInspector: React.FC<EngineeringInspectorProps> = ({
  open,
  subtitle,
  onClose,
  widthClassName = 'w-[320px]',
  children,
}) => {
  const activeView = useProjectStore((state) => state.activeView);
  const sharedSelection = useStudioContextStore((state) => state.selected);
  const currentRepresentation = inspectorRepresentationByView[activeView];
  const contextualComponentId = sharedSelection?.componentId
    ?? (sharedSelection?.entity === 'component-instance' ? sharedSelection.id : null);

  if (!open) return null;
  return (
    <EngineeringDock
      side="right"
      title="Inspector"
      subtitle={subtitle}
      onClose={onClose}
      widthClassName={widthClassName}
      chromeId="inspector"
    >
      {currentRepresentation && contextualComponentId && (
        <ElectronicsRepresentationStrip
          componentId={contextualComponentId}
          current={currentRepresentation}
        />
      )}
      {children}
    </EngineeringDock>
  );
};

interface EngineeringBottomDockProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  heightClassName?: string;
  children: React.ReactNode;
}

/**
 * Shared diagnostics/execution surface. It intentionally overlays the lower editor
 * region so closed docks cost no canvas space and no empty global panel is shown.
 */
export const EngineeringBottomDock: React.FC<EngineeringBottomDockProps> = ({
  open,
  title,
  subtitle,
  onClose,
  actions,
  heightClassName = 'h-[184px]',
  children,
}) => {
  if (!open) return null;
  return (
    <section
      className={`absolute inset-x-0 bottom-0 z-40 flex ${heightClassName} flex-col overflow-hidden border-t border-[#c9c5bb] bg-[#fbfaf6] shadow-[0_-12px_28px_rgba(17,17,15,0.08)]`}
      data-editor-chrome="bottom-dock"
      aria-label={title}
    >
      <div className="flex min-h-10 shrink-0 items-center gap-3 border-b border-[#d8d4ca] bg-[#f0eee7] px-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold tracking-[-0.01em] text-slate-950">{title}</p>
          {subtitle && <p className="mt-0.5 truncate text-[8px] leading-3 text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        <button type="button" onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center text-slate-500 hover:bg-[#dedbd2] hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400" aria-label={`Close ${title}`}>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
};

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
      className={`group inline-flex h-9 shrink-0 items-center gap-1.5 px-2.5 text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-30 ${active ? 'bg-slate-950 text-white' : 'bg-[#f8f6f0] text-slate-650 hover:bg-white hover:text-slate-950'}`}
    >
      <span className="grid h-[18px] w-[18px] place-items-center" aria-hidden="true">{children}</span>
      <span className="hidden lg:inline">{label}</span>
      {shortcut && <span className={`hidden 2xl:inline font-mono text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{shortcut}</span>}
    </button>
  );
};