'use client';

import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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

const stageLabels: Record<ElectronicsWorkflowStageId, string> = {
  'component-library': 'Components',
  'schematic-editor': 'Schematic',
  'board-settings': 'Board setup',
  'board-designer': 'PCB layout',
  'pcb-drc': 'DRC',
  'bom': 'BOM',
};

const decisionCopy: Record<ElectronicsWorkflowStageId, { title: string; consequence: string }> = {
  'component-library': {
    title: 'Choose authoritative parts before describing connectivity',
    consequence: 'Schematic, PCB, BOM, and validation reuse the same canonical component identity instead of copied records.',
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
    consequence: 'Open DRC errors or blockers prevent downstream handoff; warnings remain evidence and are never silently converted to pass.',
  },
  'bom': {
    title: 'Confirm procurement identity for every placed component',
    consequence: 'The BOM stays linked to the same project components used in schematic and PCB instead of becoming an unrelated spreadsheet.',
  },
};

function resolveStage(viewId: string): ElectronicsWorkflowStageId {
  if (viewId === 'board-studio' || viewId === 'board-components') return 'board-settings';
  if (
    viewId === 'component-library'
    || viewId === 'schematic-editor'
    || viewId === 'board-settings'
    || viewId === 'board-designer'
    || viewId === 'pcb-drc'
    || viewId === 'bom'
  ) return viewId;
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
  const nextDecision = decisionCopy[snapshot.nextStage];
  const currentDecision = decisionCopy[activeStage];
  const recommendedElsewhere = !snapshot.readyForValidation && activeStage !== snapshot.nextStage;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 text-slate-900" aria-label="Electronics engineering workspace">
      <header className="shrink-0 border-b border-slate-300 bg-white px-3 py-2">
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500">
              <span className="font-semibold text-slate-800">{stageLabels[activeStage]}</span>
              <span aria-hidden="true">·</span>
              <span>{snapshot.activeBoardName || 'No board selected'}</span>
              <span aria-hidden="true">·</span>
              <span>{snapshot.componentCount} parts</span>
              <span aria-hidden="true">·</span>
              <span>{snapshot.blockingDrcCount} blocking DRC</span>
            </div>
            <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-950">
              {snapshot.readyForValidation ? 'Electronics evidence is ready for explicit validation planning' : currentDecision.title}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {recommendedElsewhere && (
              <span className="hidden text-[10px] text-slate-500 xl:inline">Recommended next: {stageLabels[snapshot.nextStage]}</span>
            )}
            <button
              type="button"
              onClick={() => setActiveView(snapshot.readyForValidation ? 'validation-studio' : snapshot.nextStage)}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[11px] font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"
            >
              {snapshot.readyForValidation
                ? 'Plan validation'
                : recommendedElsewhere
                  ? `Go to ${stageLabels[snapshot.nextStage]}`
                  : 'Continue this decision'}
              {snapshot.readyForValidation ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {(snapshot.blockers.length > 0 || snapshot.readyForValidation) && (
          <details className="mt-1.5 text-[10px] text-slate-500">
            <summary className="cursor-pointer select-none font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400">
              {snapshot.readyForValidation ? 'Why validation is available' : `${snapshot.blockers.length} unresolved engineering condition${snapshot.blockers.length === 1 ? '' : 's'}`}
            </summary>
            <div className="mt-1.5 border-l-2 border-slate-300 pl-2.5 leading-5">
              {snapshot.readyForValidation ? (
                <p>Canonical parts, schematic placement, board geometry, PCB placement, BOM linkage, and blocking DRC checks are connected. This does not itself mark hardware verified.</p>
              ) : (
                <>
                  <p className="font-medium text-slate-700">{nextDecision.title}</p>
                  <ul className="mt-1 space-y-0.5">
                    {snapshot.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}
                  </ul>
                  <p className="mt-1"><strong className="text-slate-700">Consequence:</strong> {nextDecision.consequence}</p>
                </>
              )}
            </div>
          </details>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {renderStage(activeStage)}
      </div>
    </section>
  );
};