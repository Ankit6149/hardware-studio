'use client';

import React, { useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Boxes,
  CircuitBoard,
  Layers3,
  ListTree,
  PenTool,
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
  } = useStudioContextStore();

  const activeDomain = getDomainIdForView(activeView);
  const visible = contextualViews.has(activeView)
    || activeDomain === 'electronics'
    || activeDomain === 'pcb'
    || activeDomain === 'mechanical';

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
    setActiveView(viewId);
  };

  const changeBoard = (boardId: string) => {
    setContextBoard(boardId || null);
    if (boardId) setActiveBoard(boardId);
    const firstComponent = boardComponents.find((component) => component.boardId === boardId);
    setActiveComponent(firstComponent?.id || null);
  };

  const schematicActionLabel = selectedComponent?.schematic?.placed ? 'Schematic' : 'Place in schematic';
  const pcbActionLabel = selectedBoard ? 'PCB' : 'Create board';

  return (
    <section className="shrink-0 border-b border-slate-200 bg-slate-50 px-3 py-2" aria-label="Shared engineering context">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Working context</span>

          <label className="flex min-w-[180px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
            <CircuitBoard className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden="true" />
            <span className="sr-only">Active board</span>
            <select value={resolvedBoardId} onChange={(event) => changeBoard(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none">
              {boards.length === 0 && <option value="">No board yet</option>}
              {boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}
            </select>
          </label>

          <label className="flex min-w-[220px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
            <Boxes className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden="true" />
            <span className="sr-only">Active component instance</span>
            <select value={selectedComponent?.id || ''} onChange={(event) => setActiveComponent(event.target.value || null)} className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none">
              {componentsForBoard.length === 0 && <option value="">No component instance</option>}
              {componentsForBoard.map((component) => <option key={component.id} value={component.id}>{component.referenceDesignator} · {component.componentName}</option>)}
            </select>
          </label>

          <label className="flex min-w-[150px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
            <ListTree className="h-3.5 w-3.5 shrink-0 text-indigo-600" aria-hidden="true" />
            <span className="sr-only">Active net</span>
            <select value={activeNetName || ''} onChange={(event) => setActiveNet(event.target.value || null)} className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none">
              <option value="">No net selected</option>
              {nets.map((net) => <option key={net.id} value={net.netName}>{net.netName}</option>)}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { viewId: 'component-library', label: 'Components', Icon: Boxes },
            { viewId: 'schematic-editor', label: schematicActionLabel, Icon: PenTool },
            { viewId: 'board-designer', label: pcbActionLabel, Icon: CircuitBoard },
            { viewId: 'mechanical-studio', label: 'Assembly / 3D', Icon: Layers3 },
          ].map(({ viewId, label, Icon }, index) => (
            <React.Fragment key={viewId}>
              {index > 0 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />}
              <button
                type="button"
                onClick={() => navigate(viewId)}
                aria-current={activeView === viewId ? 'step' : undefined}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${activeView === viewId ? 'border-indigo-300 bg-indigo-100 text-indigo-900' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-slate-600">
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Board: {selectedBoard ? `${selectedBoard.layerCount} layers · ${selectedBoard.dimensionsMm} mm` : 'not created'}</span>
        <span className={`rounded-full border px-2 py-1 ${selectedComponent?.schematic?.placed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>Schematic: {selectedComponent ? selectedComponent.schematic?.placed ? 'placed' : 'unplaced' : 'no instance'}</span>
        <span className={`rounded-full border px-2 py-1 ${selectedComponent?.pcb?.placed || selectedComponent?.placementStatus === 'Placed' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>PCB: {selectedComponent ? selectedComponent.pcb?.placed || selectedComponent.placementStatus === 'Placed' ? 'placed' : 'unplaced' : 'no instance'}</span>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Footprint: {selectedComponent?.footprint || 'unresolved'}</span>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Pins: {selectedComponent?.pins?.length || 0}</span>
      </div>
    </section>
  );
};
