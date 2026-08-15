'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Boxes,
  CircuitBoard,
  FileSpreadsheet,
  PenTool,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { evaluateElectronicsWorkflow, type ElectronicsWorkflowStageId } from '../../lib/electronics/electronicsWorkflow';
import { BoardStudio } from '../BoardStudio';
import { UnifiedBoardDRCWorkbench } from './UnifiedBoardDRCWorkbench';
import { UnifiedBOMWorkbench } from './UnifiedBOMWorkbench';
import {
  UnifiedBoardDesignerWorkbench,
  UnifiedComponentLibraryWorkbench,
  UnifiedSchematicWorkbench,
} from './UnifiedWorkbenchAdapters';

export const ELECTRONICS_WORKSPACE_VIEW_IDS = new Set([
  'component-library',
  'schematic-editor',
  'board-settings',
  'board-studio',
  'board-components',
  'board-designer',
  'pcb-drc',
  'bom',
]);

const stages: { id: ElectronicsWorkflowStageId; label: string; icon: React.ReactNode }[] = [
  { id: 'component-library', label: 'Components', icon: <Boxes className="h-3.5 w-3.5" /> },
  { id: 'schematic-editor', label: 'Schematic', icon: <PenTool className="h-3.5 w-3.5" /> },
  { id: 'board-settings', label: 'Board setup', icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
  { id: 'board-designer', label: 'PCB layout', icon: <CircuitBoard className="h-3.5 w-3.5" /> },
  { id: 'pcb-drc', label: 'DRC', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { id: 'bom', label: 'BOM', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
];

function resolveStage(viewId: string): ElectronicsWorkflowStageId {
  if (viewId === 'board-studio' || viewId === 'board-components') return 'board-settings';
  if (viewId === 'component-library' || viewId === 'schematic-editor' || viewId === 'board-settings' || viewId === 'board-designer' || viewId === 'pcb-drc' || viewId === 'bom') {
    return viewId;
  }
  return 'component-library';
}

function renderStage(stage: ElectronicsWorkflowStageId) {
  switch (stage) {
    case 'component-library': return <UnifiedComponentLibraryWorkbench />;
    case 'schematic-editor': return <UnifiedSchematicWorkbench />;
    case 'board-settings': return <BoardStudio />;
    case 'board-designer': return <UnifiedBoardDesignerWorkbench />;
    case 'pcb-drc': return <UnifiedBoardDRCWorkbench />;
    case 'bom': return <UnifiedBOMWorkbench />;
  }
}

export const ElectronicsWorkspace: React.FC = () => {
  const project = useProjectStore();
  const { activeView, setActiveView } = project;
  const snapshot = useMemo(() => evaluateElectronicsWorkflow(project), [project]);
  const activeStage = resolveStage(activeView);

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 text-slate-900" aria-label="Electronics engineering workspace">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Electronics golden path</p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                one product graph
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">
              {snapshot.activeBoardName || 'No board selected'} · {snapshot.componentCount} components · {snapshot.netCount} nets · {snapshot.routedNetCount} routed nets
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 text-[10px]">
            <button type="button" onClick={() => setActiveView('power-tree')} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-100">
              <Zap className="h-3.5 w-3.5" /> Power
            </button>
            <button type="button" onClick={() => setActiveView('pin-map')} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-100">
              Pin map
            </button>
          </div>
        </div>

        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto border-t border-slate-100 px-3 py-1.5" aria-label="Electronics lifecycle stages">
          {stages.map((stage, index) => {
            const active = stage.id === activeStage;
            const recommended = stage.id === snapshot.nextStage && !active;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveView(stage.id)}
                aria-current={active ? 'step' : undefined}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  active
                    ? 'bg-slate-950 text-white'
                    : recommended
                      ? 'bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="font-mono text-[9px] opacity-60">{String(index + 1).padStart(2, '0')}</span>
                {stage.icon}
                {stage.label}
              </button>
            );
          })}
        </nav>

        <div className="flex min-h-8 flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-[10px] text-slate-600">
          <span><strong className="text-slate-800">Schematic</strong> {snapshot.schematicPlacedCount}/{snapshot.componentCount} placed</span>
          <span><strong className="text-slate-800">PCB</strong> {snapshot.pcbPlacedCount}/{snapshot.componentCount} placed</span>
          <span><strong className="text-slate-800">BOM</strong> {snapshot.linkedBomCount}/{snapshot.componentCount} linked</span>
          <span><strong className="text-slate-800">Outline</strong> {snapshot.hasBoardOutline ? 'recorded' : 'missing'}</span>
          {snapshot.blockers.length > 0 ? (
            <span className="ml-auto inline-flex min-w-0 items-center gap-1.5 text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[34rem] truncate">{snapshot.blockers[0]}</span>
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Canonical path evidence connected
            </span>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {renderStage(activeStage)}
      </div>
    </section>
  );
};
