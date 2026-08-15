'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
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

const decisionCopy: Record<ElectronicsWorkflowStageId, { title: string; consequence: string }> = {
  'component-library': {
    title: 'Choose authoritative parts before describing connectivity',
    consequence: 'Schematic, PCB, BOM, and validation all reuse the same canonical component identity instead of copied records.',
  },
  'schematic-editor': {
    title: 'Decide how the selected parts are electrically connected',
    consequence: 'Only explicit pin/net relationships move forward; visual proximity never becomes connectivity by accident.',
  },
  'board-settings': {
    title: 'Establish the real PCB boundary before physical placement',
    consequence: 'PCB layout remains blocked until an explicit board and outline exist; metadata dimensions are not promoted into manufacturing geometry.',
  },
  'board-designer': {
    title: 'Place the canonical components on the selected physical board',
    consequence: 'Placement becomes board-scoped evidence used by DRC, mechanical sync, CPL, and manufacturing checks.',
  },
  'pcb-drc': {
    title: 'Review rule and connectivity evidence before electronics handoff',
    consequence: 'Open DRC errors/blockers prevent downstream handoff; warnings remain visible evidence and are never silently converted to pass.',
  },
  'bom': {
    title: 'Confirm procurement identity for every placed component',
    consequence: 'The BOM stays linked to the same project components used in schematic and PCB instead of becoming an unrelated spreadsheet.',
  },
};

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
  const decision = decisionCopy[snapshot.nextStage];

  const isStageComplete = (stage: ElectronicsWorkflowStageId) => {
    switch (stage) {
      case 'component-library': return snapshot.componentCount > 0 && snapshot.missingFootprintCount === 0;
      case 'schematic-editor': return snapshot.componentCount > 0 && snapshot.schematicPlacedCount === snapshot.componentCount;
      case 'board-settings': return Boolean(snapshot.activeBoardId && snapshot.hasBoardOutline);
      case 'board-designer': return snapshot.componentCount > 0 && snapshot.pcbPlacedCount === snapshot.componentCount;
      case 'pcb-drc': return snapshot.componentCount > 0 && snapshot.pcbPlacedCount === snapshot.componentCount && snapshot.blockingDrcCount === 0;
      case 'bom': return snapshot.componentCount > 0 && snapshot.linkedBomCount === snapshot.componentCount;
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 text-slate-900" aria-label="Electronics engineering workspace">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className={`border-b px-4 py-3 ${snapshot.readyForValidation ? 'border-emerald-200 bg-emerald-50/70' : snapshot.blockers.length > 0 ? 'border-amber-200 bg-amber-50/75' : 'border-indigo-200 bg-indigo-50/70'}`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Current electronics decision</p>
                <span className="rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                  {snapshot.activeBoardName || 'No board context'}
                </span>
              </div>
              <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-950">
                {snapshot.readyForValidation ? 'Define the validation evidence for the connected electronics design' : decision.title}
              </h2>
              <p className="mt-0.5 text-[11px] leading-5 text-slate-600">
                {snapshot.readyForValidation
                  ? 'Canonical parts, schematic placement, board geometry, PCB placement, BOM linkage, and blocking DRC checks are connected. The next step is evidence—not another status label.'
                  : snapshot.blockers[0] || 'Continue the connected electronics lifecycle without duplicating engineering state.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <span className="min-h-8 rounded-lg border border-white/80 bg-white/80 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{snapshot.componentCount} parts</span>
              <span className="min-h-8 rounded-lg border border-white/80 bg-white/80 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{snapshot.routedNetCount}/{snapshot.netCount} routed nets</span>
              <span className="min-h-8 rounded-lg border border-white/80 bg-white/80 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{snapshot.blockingDrcCount} DRC blockers</span>
              <span className="min-h-8 rounded-lg border border-white/80 bg-white/80 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{snapshot.linkedBomCount}/{snapshot.componentCount} BOM linked</span>
              <button
                type="button"
                onClick={() => setActiveView(snapshot.readyForValidation ? 'validation-studio' : snapshot.nextStage)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-3.5 text-[10px] font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                {snapshot.readyForValidation ? 'Open Validation' : activeStage === snapshot.nextStage ? 'Work this decision' : `Continue to ${stages.find((stage) => stage.id === snapshot.nextStage)?.label}`}
                {snapshot.readyForValidation ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            </div>
          </div>
          <p className="mt-2 border-t border-black/5 pt-2 text-[10px] leading-4 text-slate-500"><strong className="text-slate-700">Consequence:</strong> {snapshot.readyForValidation ? 'Electronics can now move into explicit validation planning; this state does not itself mark hardware verified.' : decision.consequence}</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2">
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Electronics lifecycle stages" role="tablist">
            {stages.map((stage, index) => {
              const active = stage.id === activeStage;
              const recommended = stage.id === snapshot.nextStage && !snapshot.readyForValidation;
              const complete = isStageComplete(stage.id);
              return (
                <button
                  key={stage.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveView(stage.id)}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                  {complete && <CheckCircle2 className={`h-3 w-3 ${active ? 'text-emerald-300' : 'text-emerald-600'}`} aria-label="Complete" />}
                </button>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
            <button type="button" onClick={() => setActiveView('power-tree')} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" /> Power
            </button>
            <button type="button" onClick={() => setActiveView('pin-map')} className="min-h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Pin map
            </button>
          </div>
        </div>

        {snapshot.blockers.length > 1 && !snapshot.readyForValidation && (
          <details className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-600">
            <summary className="cursor-pointer font-semibold text-amber-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">{snapshot.blockers.length - 1} additional unresolved decision{snapshot.blockers.length - 1 === 1 ? '' : 's'}</summary>
            <ul className="mt-2 space-y-1.5 pl-5">
              {snapshot.blockers.slice(1).map((blocker) => <li key={blocker} className="list-disc leading-5">{blocker}</li>)}
            </ul>
          </details>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {renderStage(activeStage)}
      </div>
    </section>
  );
};
