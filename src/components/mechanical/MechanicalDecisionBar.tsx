'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, ArrowRight, Box, Layers, RefreshCw, ShieldCheck } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore, type MechanicalWorkbenchMode } from '../../store/studioContextStore';
import type { AssemblyLayer, BoardItem, BoardOutline, MechanicalObject } from '../../types';
import { useFeedback } from '../feedback/FeedbackProvider';
import { validateMechanicalLayout } from '../../lib/mechanical/mechanicalValidation';
import {
  buildMechanicalBoardEnvelope,
  evaluateMechanicalBoardContext,
} from '../../lib/mechanical/boardMechanicalContext';

const EMPTY_MECHANICAL_OBJECTS: MechanicalObject[] = [];
const EMPTY_ASSEMBLY_LAYERS: AssemblyLayer[] = [];
const EMPTY_BOARDS: BoardItem[] = [];
const EMPTY_BOARD_OUTLINES: BoardOutline[] = [];

export const MechanicalDecisionBar: React.FC<{ currentMode: MechanicalWorkbenchMode }> = ({ currentMode }) => {
  const objects = useProjectStore((state) => state.mechanicalObjects ?? EMPTY_MECHANICAL_OBJECTS);
  const layers = useProjectStore((state) => state.assemblyLayers ?? EMPTY_ASSEMBLY_LAYERS);
  const boards = useProjectStore((state) => state.boards ?? EMPTY_BOARDS);
  const boardOutlines = useProjectStore((state) => state.boardOutlines ?? EMPTY_BOARD_OUTLINES);
  const projectActiveBoardId = useProjectStore((state) => state.activeBoardId);
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const contextBoardId = useStudioContextStore((state) => state.activeBoardId);
  const requestMechanicalMode = useStudioContextStore((state) => state.requestMechanicalMode);
  const { notify } = useFeedback();

  const preferredBoardId = contextBoardId || projectActiveBoardId || null;
  const boardContext = useMemo(
    () => evaluateMechanicalBoardContext(useProjectStore.getState(), preferredBoardId),
    [boardOutlines, boards, objects, preferredBoardId],
  );
  const issues = useMemo(() => validateMechanicalLayout(objects), [objects]);
  const blockingIssues = useMemo(() => issues.filter((issue) => issue.severity === 'Error'), [issues]);
  const unresolvedLayers = useMemo(
    () => layers.filter((layer) => !layer.material.trim() || !layer.inspectionNote.trim()),
    [layers],
  );

  const syncEnvelope = () => {
    const currentProject = useProjectStore.getState();
    const context = evaluateMechanicalBoardContext(currentProject, preferredBoardId);
    const envelope = buildMechanicalBoardEnvelope(currentProject, preferredBoardId);
    if (!context.boardId || !envelope) {
      notify({
        tone: 'warning',
        title: 'Authoritative PCB outline required',
        detail: context.blockers[0] || 'Mechanical cannot create a board envelope without explicit PCB geometry.',
      });
      return;
    }

    currentProject.executeProjectCommand('SYNC_BOARD_ENVELOPE', 'Sync PCB envelope into mechanical workspace', () => {
      const state = useProjectStore.getState();
      const existing = (state.mechanicalObjects || []).find(
        (object) => object.type === 'Board Zone' && object.linkedBoardId === context.boardId,
      );
      if (existing) state.updateMechanicalObject(existing.id, envelope);
      else state.addMechanicalObject(envelope);
    });

    notify({
      tone: 'success',
      title: context.syncState === 'stale' ? 'PCB envelope refreshed' : 'PCB envelope linked',
      detail: `${context.boardName} now uses the current explicit PCB outline. No enclosure geometry was invented.`,
    });
  };

  let title = 'Establish the physical reference before enclosure decisions';
  let detail = boardContext.blockers[0] || 'Mechanical work needs an explicit board and board outline before spatial decisions can be trusted.';
  let consequence = 'Mechanical remains blocked instead of guessing board size or placement.';
  let actionLabel = 'Open board setup';
  let action = () => setActiveView(boardContext.syncState === 'missing-outline' ? 'board-designer' : 'board-settings');
  let tone = 'border-amber-200 bg-amber-50/80';
  let ActionIcon = ArrowRight;

  if (boardContext.syncState === 'not-synced' || boardContext.syncState === 'stale') {
    title = boardContext.syncState === 'stale' ? 'Refresh the PCB envelope before making enclosure decisions' : 'Bring authoritative PCB geometry into Mechanical';
    detail = boardContext.syncState === 'stale'
      ? 'The PCB outline changed after the current mechanical envelope was created.'
      : 'A real PCB outline exists, but Mechanical is not yet linked to it.';
    consequence = 'Syncing copies only the explicit board outline as locked derived evidence; it does not manufacture enclosure dimensions.';
    actionLabel = boardContext.syncState === 'stale' ? 'Refresh PCB envelope' : 'Sync PCB envelope';
    action = syncEnvelope;
    ActionIcon = RefreshCw;
  } else if (boardContext.syncState === 'synced' && blockingIssues.length > 0) {
    title = 'Resolve mechanical interference before assembly decisions';
    detail = blockingIssues[0]?.message || 'Mechanical validation found blocking geometry conflicts.';
    consequence = 'Assembly and 3D review stay downstream until the conflicting physical relationships are corrected.';
    actionLabel = currentMode === 'canvas' ? 'Keep editing layout' : 'Open 2D layout';
    action = () => {
      requestMechanicalMode('canvas');
      setActiveView('mechanical-studio');
    };
  } else if (boardContext.syncState === 'synced' && issues.length > 0) {
    title = 'Review unresolved mechanical evidence';
    detail = issues[0]?.message || 'Mechanical review still contains unresolved findings.';
    consequence = 'Warnings do not automatically block exploration, but they remain visible evidence for the next physical decision.';
    actionLabel = 'Review 2D layout';
    action = () => {
      requestMechanicalMode('canvas');
      setActiveView('mechanical-studio');
    };
  } else if (boardContext.syncState === 'synced' && layers.length === 0) {
    title = 'Define how the physical product is assembled';
    detail = 'The board envelope and current mechanical layout are coherent, but no ordered assembly stack has been recorded.';
    consequence = '3D inspection can show geometry, but manufacturing/validation cannot reason about material and assembly order yet.';
    actionLabel = 'Build assembly stack';
    action = () => setActiveView('assembly-stack');
    tone = 'border-indigo-200 bg-indigo-50/70';
    ActionIcon = Layers;
  } else if (boardContext.syncState === 'synced' && unresolvedLayers.length > 0) {
    title = 'Complete assembly evidence before handoff';
    detail = `${unresolvedLayers.length} assembly layer${unresolvedLayers.length === 1 ? ' is' : 's are'} missing material or inspection evidence.`;
    consequence = 'Unknown material or inspection facts remain explicit instead of being inferred from the visual stack.';
    actionLabel = 'Complete assembly evidence';
    action = () => setActiveView('assembly-stack');
    tone = 'border-indigo-200 bg-indigo-50/70';
    ActionIcon = Layers;
  } else if (boardContext.syncState === 'synced' && currentMode !== 'webgl-3d') {
    title = 'Inspect the connected physical model before validation';
    detail = 'Authoritative PCB context, mechanical checks, and assembly evidence are connected. Use 3D to inspect the same selected board and components.';
    consequence = '3D is a review representation only; passing visual inspection does not mark the product verified.';
    actionLabel = 'Open connected 3D';
    action = () => {
      requestMechanicalMode('webgl-3d');
      setActiveView('mechanical-studio');
    };
    tone = 'border-emerald-200 bg-emerald-50/70';
    ActionIcon = Box;
  } else if (boardContext.syncState === 'synced') {
    title = 'Decide what mechanical evidence must be validated';
    detail = 'The connected 3D representation is ready for review. Define tests for dimensions, fit, clearances, assembly, and physical risks rather than treating the view as proof.';
    consequence = 'Validation creates explicit evidence; the 3D view itself never grants a verified state.';
    actionLabel = 'Open Validation';
    action = () => setActiveView('validation-studio');
    tone = 'border-emerald-200 bg-emerald-50/70';
    ActionIcon = ShieldCheck;
  }

  return (
    <section className={`shrink-0 border-b px-3 py-2.5 ${tone}`} aria-labelledby="mechanical-decision-title">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Current mechanical decision</p>
          <h2 id="mechanical-decision-title" className="mt-1 text-sm font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-0.5 text-[11px] leading-5 text-slate-600">{detail}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/80 bg-white/75 px-2.5 text-[10px] font-semibold text-slate-600">
            {boardContext.syncState === 'synced' ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />}
            PCB {boardContext.syncState}
          </span>
          <span className="min-h-8 rounded-lg border border-white/80 bg-white/75 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{objects.length} objects</span>
          <span className="min-h-8 rounded-lg border border-white/80 bg-white/75 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{issues.length} findings</span>
          <span className="min-h-8 rounded-lg border border-white/80 bg-white/75 px-2.5 py-2 text-[10px] font-semibold text-slate-600">{layers.length} assembly layers</span>
          <button
            type="button"
            onClick={action}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3.5 text-[10px] font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {actionLabel}<ActionIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="mt-2 border-t border-black/5 pt-2 text-[10px] leading-4 text-slate-500"><strong className="text-slate-700">Consequence:</strong> {consequence}</p>
    </section>
  );
};
