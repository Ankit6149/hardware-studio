'use client';

import React from 'react';
import {
  Binary,
  Boxes,
  Box,
  CheckSquare,
  CircuitBoard,
  Cpu,
  Download,
  FileCheck2,
  FileText,
  Home,
  Layers,
  ListTree,
  Network,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Ruler,
  ShieldAlert,
  Table,
  Tags,
  TestTube2,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  getContextualNavigationItemsForView,
  getNavigationItem,
  getWorkbenchForView,
  workbenchTabs,
  type NavigationIconKey,
} from '../lib/navigationRegistry';
import { useProjectStore } from '../store/projectStore';

interface StudioWorkbenchTabsProps {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}

interface StudioProjectDrawerProps {
  open: boolean;
}

const iconByKey: Record<NavigationIconKey, LucideIcon> = {
  dashboard: Home,
  product: Cpu,
  readiness: FileCheck2,
  requirements: CheckSquare,
  architecture: Network,
  risk: ShieldAlert,
  blueprint: ListTree,
  mechanical: Box,
  assembly: Layers,
  components: Boxes,
  schematic: Workflow,
  power: Zap,
  'pin-map': Tags,
  bom: Table,
  board: CircuitBoard,
  layers: Layers,
  rules: Ruler,
  drc: ShieldAlert,
  firmware: Binary,
  'state-machine': Workflow,
  mapping: Cpu,
  source: FileText,
  validation: TestTube2,
  coverage: FileCheck2,
  'factory-qa': CheckSquare,
  exports: Download,
  'factory-package': Package,
  revisions: FileText,
  branches: ListTree,
  releases: Package,
};

export const StudioWorkbenchTabs: React.FC<StudioWorkbenchTabsProps> = ({ drawerOpen, onToggleDrawer }) => {
  const activeView = useProjectStore((state) => state.activeView);
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const activeWorkbench = getWorkbenchForView(activeView);
  const contextualItems = getContextualNavigationItemsForView(activeView);
  const hasDrawer = contextualItems.length > 0;

  return (
    <div className="flex h-10 shrink-0 items-stretch border-b border-[#cfc9bd] bg-[#f4f0e7]" data-studio-shell="workbench-tabs">
      <div className="flex w-10 shrink-0 items-center justify-center border-r border-[#d7d0c4]">
        {hasDrawer ? (
          <button
            type="button"
            onClick={onToggleDrawer}
            className="grid h-8 w-8 place-items-center text-slate-500 transition-colors hover:bg-black/[0.04] hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70"
            aria-label={drawerOpen ? 'Hide project drawer' : 'Show project drawer'}
            aria-expanded={drawerOpen}
            title={drawerOpen ? 'Hide project drawer' : 'Show project drawer'}
          >
            {drawerOpen ? <PanelLeftClose className="h-4 w-4" aria-hidden="true" /> : <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />}
          </button>
        ) : (
          <span className="h-8 w-8" aria-hidden="true" />
        )}
      </div>

      <nav
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:thin]"
        aria-label="Open product workbenches"
        role="tablist"
      >
        {workbenchTabs.map((workbench) => {
          const Icon = iconByKey[workbench.icon];
          const active = activeWorkbench?.id === workbench.id;
          return (
            <button
              key={workbench.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="workspace-main"
              onClick={() => setActiveView(workbench.defaultView)}
              title={`${workbench.label} — ${workbench.purpose}`}
              className={`relative inline-flex min-w-max items-center gap-1.5 border-r border-[#d7d0c4] px-3 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70 ${
                active
                  ? 'bg-[#fbfaf6] text-slate-950'
                  : 'text-slate-500 hover:bg-[#ebe5da] hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
              <span>{workbench.label}</span>
              {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-950" aria-hidden="true" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export const StudioProjectDrawer: React.FC<StudioProjectDrawerProps> = ({ open }) => {
  const activeView = useProjectStore((state) => state.activeView);
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const activeWorkbench = getWorkbenchForView(activeView);
  const activeItem = getNavigationItem(activeView);
  const contextualItems = getContextualNavigationItemsForView(activeView);

  if (!open || !activeWorkbench || contextualItems.length === 0) return null;

  return (
    <aside
      className="z-20 flex h-full w-[192px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f7f3eb]"
      aria-label={`${activeWorkbench.label} project drawer`}
      data-studio-shell="project-drawer"
    >
      <div className="shrink-0 border-b border-[#d8d1c5] px-3 py-2.5">
        <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">Project tools</div>
        <h2 className="mt-1 text-[12px] font-semibold tracking-[-0.01em] text-slate-950">{activeWorkbench.label}</h2>
        <p className="mt-1 text-[9px] leading-4 text-slate-500">Only tools relevant to this work surface are shown here.</p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-1.5" aria-label={`${activeWorkbench.label} contextual tools`}>
        {contextualItems.map((item) => {
          const Icon = iconByKey[item.icon];
          const active = activeView === item.id || activeItem?.surface === item.surface;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              aria-current={active ? 'page' : undefined}
              title={item.purpose}
              className={`group relative flex min-h-10 w-full items-center gap-2 px-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70 ${
                active ? 'bg-[#e4ddd0] text-slate-950' : 'text-slate-600 hover:bg-[#ece6dc] hover:text-slate-950'
              }`}
            >
              {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-slate-950" aria-hidden="true" />}
              <span className={`grid h-6 w-6 shrink-0 place-items-center border ${active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-[#fbfaf6] text-slate-500'}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold">{item.label}</span>
                <span className="mt-0.5 block truncate text-[8px] text-slate-400">{item.badge}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
