'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Boxes,
  CircuitBoard,
  FileSpreadsheet,
  Layers3,
  ListTree,
  PenTool,
  TestTube2,
} from 'lucide-react';
import { getDomainIdForView } from '../../lib/workflowProfiles';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';

const contextualViews = new Set([
  'component-library',
  'schematic-editor',
  'power-tree',
  'pin-map',
  'bom',
  'board-settings',
  'board-designer',
  'pcb-drc',
  'pcb-constraints',
  'mechanical-studio',
  'assembly-stack',
  'blueprint-sheets',
  'exports',
  'validation-studio',
  'requirement-coverage',
]);

export const EngineeringContextBar: React.FC = () => {
  const store = useProjectStore();
  const {
    activeView,
    setActiveView,
    setActiveBoard,
    placeComponentOnSchematic,
    boards = [],
    boardComponents = [],
    nets = [],
  } = store;
  const {
    activeBoardId,
    activeComponentId,
    activeNetName,
    setActiveBoard: setContextBoard,
    setActiveComponent,
    setActiveNet,
    beginHandoff,
    requestMechanicalMode,
  } = useStudioContextStore();

  const activeDomain = getDomainIdForView(activeView);
  const visible = contextualViews.has(activeView)
    || activeDomain === 'electronics'
    || activeDomain === 'pcb'
    || activeDomain === 'mechanical'
    || activeDomain === 'validation';

  const resolvedBoardId = activeBoardId || store.activeBoardId || boards[0]?.id || '';
  const componentsForBoard = useMemo(
    () => boardComponents.filter((component) => !resolvedBoardId || component.boardId === resolvedBoardId),
    [boardComponents, resolvedBoardId],
  );
  const selectedComponent = boardComponents.find((component) => component.id === activeComponentId)
    || componentsForBoard[0];
  const selectedBoard = boards.find((board) => board.id === resolvedBoardId) || boards[0];

  useEffect(() => {
    if (!activeBoardId && resolvedBoardId) setContextBoard(resolvedBoardId);
  }, [activeBoardId, resolvedBoardId, setContextBoard]);

  useEffect(() => {
    const selectedStillExists = activeComponentId
      ? componentsForBoard.some((component) => component.id === activeComponentId)
      : false;
    if ((!activeComponentId || !selectedStillExists) && componentsForBoard[0]) {
      setActiveComponent(componentsForBoard[0].id);
    }
  }, [activeComponentId, componentsForBoard, setActiveComponent]);

  if (!visible) return null;

  const navigate = (viewId: string) => {
    beginHandoff(activeView, activeView);
    if (viewId === 'schematic-editor' && selectedComponent && !selectedComponent.schematic?.placed) {
      const placedCount = componentsForBoard.filter((component) => component.schematic?.placed).length;
      const column = placedCount % 4;
      const row = Math.floor(placedCount / 4);
      placeComponentOnSchematic(selectedComponent.id, 140 + column * 180, 140 + row * 140);
    }
    if (viewId === 'board-designer' && !selectedBoard) {
      setActiveView('board-settings');
      return;
    }
    requestMechanicalMode(viewId === 'mechanical-studio' ? 'webgl-3d' : null);
    setActiveView(viewId);
  };

  const changeBoard = (boardId: string) => {
    setContextBoard(boardId || null);
    if (boardId) setActiveBoard(boardId);
    const firstComponent = boardComponents.find((component) => component.boardId === boardId);
    setActiveComponent(firstComponent?.id || null);
  };

  const schematicActionLabel = selectedComponent?.schematic?.placed ? 'Schematic' : 'Place';
  const pcbActionLabel = selectedBoard ? 'PCB' : 'Board';

  const handoffs = [
    { viewId: 'component-library', label: 'Parts', Icon: Boxes },
    { viewId: 'schematic-editor', label: schematicActionLabel, Icon: PenTool },
    { viewId: 'board-designer', label: pcbActionLabel, Icon: CircuitBoard },
    { viewId: 'mechanical-studio', label: '3D', Icon: Layers3 },
    { viewId: 'bom', label: 'BOM', Icon: FileSpreadsheet },
    { viewId: 'validation-studio', label: 'Validate', Icon: TestTube2 },
  ] as const;

  const schematicState = selectedComponent ? selectedComponent.schematic?.placed ? 'Placed' : 'Unplaced' : 'No instance';
  const pcbState = selectedComponent
    ? selectedComponent.pcb?.placed || selectedComponent.placementStatus === 'Placed' ? 'Placed' : 'Unplaced'
    : 'No instance';

  return (
    <section className="relative z-10 shrink-0 border-b border-slate-300 bg-[#f8f5ee] px-2.5 py-1.5" aria-label="Shared engineering context">
      <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
        <span className="mr-1 hidden shrink-0 text-[10px] font-semibold text-slate-500 xl:inline">Context</span>

        <label className="flex h-8 min-w-[150px] shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2">
          <CircuitBoard className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="sr-only">Active board</span>
          <select value={resolvedBoardId} onChange={(event) => changeBoard(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-slate-800 outline-none">
            {boards.length === 0 && <option value="">No board</option>}
            {boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}
          </select>
        </label>

        <label className="flex h-8 min-w-[190px] shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2">
          <Boxes className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="sr-only">Active component instance</span>
          <select value={selectedComponent?.id || ''} onChange={(event) => setActiveComponent(event.target.value || null)} className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-slate-800 outline-none">
            {componentsForBoard.length === 0 && <option value="">No component</option>}
            {componentsForBoard.map((component) => <option key={component.id} value={component.id}>{component.referenceDesignator} · {component.componentName}</option>)}
          </select>
        </label>

        <label className="flex h-8 min-w-[130px] shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2">
          <ListTree className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="sr-only">Active net</span>
          <select value={activeNetName || ''} onChange={(event) => setActiveNet(event.target.value || null)} className="min-w-0 flex-1 bg-transparent text-[11px] font-medium text-slate-800 outline-none">
            <option value="">No net</option>
            {nets.map((net) => <option key={net.id} value={net.netName}>{net.netName}</option>)}
          </select>
        </label>

        <div className="mx-1 h-5 w-px shrink-0 bg-slate-300" aria-hidden="true" />

        <div className="flex shrink-0 items-center gap-0.5" aria-label="Connected handoffs">
          {handoffs.map(({ viewId, label, Icon }) => (
            <button
              key={viewId}
              type="button"
              onClick={() => navigate(viewId)}
              aria-current={activeView === viewId ? 'step' : undefined}
              className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/70 ${
                activeView === viewId ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <details className="relative ml-auto shrink-0">
          <summary className="flex h-8 cursor-pointer list-none items-center rounded-md border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400/70 [&::-webkit-details-marker]:hidden">
            Evidence
          </summary>
          <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
            <dl className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-2 text-[11px]">
              <dt className="text-slate-500">Board</dt>
              <dd className="font-medium text-slate-900">{selectedBoard ? `${selectedBoard.layerCount || '?'} layers · ${selectedBoard.dimensionsMm || 'dimensions unresolved'}` : 'Not created'}</dd>
              <dt className="text-slate-500">Schematic</dt>
              <dd className="font-medium text-slate-900">{schematicState}</dd>
              <dt className="text-slate-500">PCB</dt>
              <dd className="font-medium text-slate-900">{pcbState}</dd>
              <dt className="text-slate-500">Footprint</dt>
              <dd className="font-medium text-slate-900">{selectedComponent?.footprint || 'Unresolved'}</dd>
              <dt className="text-slate-500">Pins</dt>
              <dd className="font-medium text-slate-900">{selectedComponent?.pins?.length || 0}</dd>
              <dt className="text-slate-500">BOM</dt>
              <dd className="font-medium text-slate-900">{selectedComponent?.bomItemId ? 'Linked' : 'Unlinked'}</dd>
            </dl>
            <p className="mt-3 border-t border-slate-200 pt-2 text-[10px] leading-4 text-amber-800">3D is preview context, not authoritative CAD geometry.</p>
          </div>
        </details>
      </div>
    </section>
  );
};
