'use client';

import React, { useCallback, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { BoardDesignerUIState, DEFAULT_VIEW_STATE } from './boardInteraction';
import { BoardToolbar } from './BoardToolbar';
import { BoardCanvas } from './BoardCanvas';
import { BoardLayerPanel } from './BoardLayerPanel';
import { BoardInspector } from './BoardInspector';
import { BoardNetPanel } from './BoardNetPanel';
import { BoardComponentBin } from './BoardComponentBin';
import { BoardDRCPanel } from './BoardDRCPanel';
import { BoardStatusBar } from './BoardStatusBar';
import { runBoardDRC } from '../../lib/boardDRC';
import {
  autoPlaceComponents as autoPlaceFn,
  roughAutorouteNet,
  inferPadNetAssignments,
} from './boardGeometry';
import { Project, ReviewResult } from '../../types';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircuitBoard,
  Cpu,
  Network,
  PenTool,
} from 'lucide-react';
import { useFeedback } from '../feedback/FeedbackProvider';

type RightTab = 'inspector' | 'nets' | 'drc';

export const BoardDesigner: React.FC = () => {
  const store = useProjectStore();
  const { notify } = useFeedback();
  const {
    boardOutlines = [],
    boardComponents = [],
    nets = [],
    traces = [],
    boards = [],
    pcbLayers = [],
    setActiveView,
    setActiveBoard,
    generateBlueprintPack,
    addTrace,
  } = store;
  const {
    activeBoardId: contextBoardId,
    activeComponentId: contextComponentId,
    activeNetName: contextNetName,
    setActiveBoard: setContextBoard,
    setActiveComponent: setContextComponent,
    setActiveNet: setContextNet,
    beginHandoff,
  } = useStudioContextStore();

  const initialBoardId = [contextBoardId, store.activeBoardId, boards[0]?.id]
    .find((candidate): candidate is string => Boolean(candidate && boards.some((board) => board.id === candidate)))
    || null;

  const [viewState, setViewState] = useState<BoardDesignerUIState>({
    ...DEFAULT_VIEW_STATE,
    activeBoardId: initialBoardId,
    activeLayerId: pcbLayers[0]?.id || 'top-copper',
    selectedComponentId: contextComponentId,
    selectedNetName: contextNetName,
  });
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [drcResults, setDrcResults] = useState<ReviewResult[]>([]);

  const updateView = useCallback((patch: Partial<BoardDesignerUIState>) => {
    setViewState((previous) => ({ ...previous, ...patch }));
    if (patch.activeBoardId !== undefined) {
      setContextBoard(patch.activeBoardId);
      setActiveBoard(patch.activeBoardId || '');
    }
    if (patch.selectedComponentId !== undefined) setContextComponent(patch.selectedComponentId);
    if (patch.selectedNetName !== undefined) setContextNet(patch.selectedNetName);
  }, [setActiveBoard, setContextBoard, setContextComponent, setContextNet]);

  const handleRunDRC = useCallback(() => {
    const project = useProjectStore.getState();
    const results = runBoardDRC({
      ...project,
      activeBoardId: viewState.activeBoardId || '',
    });
    setDrcResults(results);
    setRightTab('drc');
  }, [viewState.activeBoardId]);

  const handleAutoPlace = useCallback(() => {
    const boardId = viewState.activeBoardId;
    if (!boardId || !boards.some((board) => board.id === boardId)) {
      notify({
        tone: 'warning',
        title: 'Select a real board first',
        detail: 'Auto placement will not create or infer a board identity.',
      });
      return;
    }

    const outline = boardOutlines.find((candidate) => candidate.boardId === boardId);
    if (!outline) {
      notify({
        tone: 'warning',
        title: 'Board outline required',
        detail: 'Auto placement needs the selected board’s real outline. Hardware Studio will not place components inside a hidden 50 × 30 mm fallback.',
      });
      return;
    }

    const componentsForBoard = boardComponents.filter((component) => component.boardId === boardId);
    const placed = autoPlaceFn(componentsForBoard, outline);
    for (const component of placed) {
      store.updateBoardComponent(component.id, {
        placementX: component.placementX,
        placementY: component.placementY,
        placementStatus: component.placementStatus,
      });
    }

    const project = useProjectStore.getState();
    const scopedProject = {
      ...project,
      activeBoardId: boardId,
      boardComponents: (project.boardComponents || []).filter((component) => component.boardId === boardId),
      traces: (project.traces || []).filter((trace) => trace.boardId === boardId),
    } as Project;
    store.setPadNetAssignments(inferPadNetAssignments(scopedProject));
    handleRunDRC();
  }, [boardComponents, boardOutlines, boards, handleRunDRC, notify, store, viewState.activeBoardId]);

  const handleRoughAutoroute = useCallback(() => {
    const boardId = viewState.activeBoardId;
    if (!boardId || !boards.some((board) => board.id === boardId)) {
      notify({
        tone: 'warning',
        title: 'Select a real board first',
        detail: 'Rough autoroute cannot run without an explicit board context.',
      });
      return;
    }

    const project = useProjectStore.getState();
    const scopedProject = {
      ...project,
      activeBoardId: boardId,
      boardComponents: (project.boardComponents || []).filter((component) => component.boardId === boardId),
      traces: (project.traces || []).filter((trace) => trace.boardId === boardId),
      vias: (project.vias || []).filter((via) => via.boardId === boardId),
      boardOutlines: (project.boardOutlines || []).filter((outline) => outline.boardId === boardId),
    } as Project;
    const layerId = viewState.activeLayerId || 'top-copper';

    for (const net of nets) {
      const existing = traces.filter((trace) => trace.netName === net.netName && trace.boardId === boardId);
      if (existing.length > 0) continue;
      const trace = roughAutorouteNet(scopedProject, net.netName, layerId, boardId);
      if (trace) addTrace(trace);
    }
    handleRunDRC();
  }, [addTrace, boards, handleRunDRC, nets, notify, traces, viewState.activeBoardId, viewState.activeLayerId]);

  const handleGenerateBlueprint = useCallback(() => {
    if (!viewState.activeBoardId) {
      notify({ tone: 'warning', title: 'Select a board first', detail: 'Blueprint generation needs explicit board context.' });
      return;
    }
    generateBlueprintPack();
    beginHandoff('board-designer', 'board-designer');
    setActiveView('blueprint-sheets');
  }, [beginHandoff, generateBlueprintPack, notify, setActiveView, viewState.activeBoardId]);

  const handleExportBoard = useCallback(() => {
    if (!viewState.activeBoardId) {
      notify({ tone: 'warning', title: 'Select a board first', detail: 'Board export needs explicit board context.' });
      return;
    }
    beginHandoff('board-designer', 'board-designer');
    setActiveView('exports');
  }, [beginHandoff, notify, setActiveView, viewState.activeBoardId]);

  const handleOpenFactory = useCallback(() => {
    if (!viewState.activeBoardId) {
      notify({ tone: 'warning', title: 'Select a board first', detail: 'Manufacturing preparation needs explicit board context.' });
      return;
    }
    beginHandoff('board-designer', 'board-designer');
    setActiveView('factory-builder');
  }, [beginHandoff, notify, setActiveView, viewState.activeBoardId]);

  const drcCount = drcResults.filter((result) => result.severity === 'Error' || result.severity === 'Blocker').length;
  const activeBoard = boards.find((board) => board.id === viewState.activeBoardId);
  const activeBoardComponents = activeBoard
    ? boardComponents.filter((component) => component.boardId === activeBoard.id)
    : [];

  if (!activeBoard) {
    return (
      <section className="flex h-full min-h-0 flex-1 items-center justify-center overflow-y-auto bg-slate-50 p-4 sm:p-6" aria-labelledby="pcb-empty-title">
        <div className="w-full max-w-5xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span className="grid h-12 w-12 place-items-center rounded-md border border-slate-200 bg-slate-50 text-indigo-700"><CircuitBoard className="h-6 w-6" aria-hidden="true" /></span>
              <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">PCB · Connected entry</p>
              <h1 id="pcb-empty-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Define or select a real board before PCB layout</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">PCB layout consumes the same project components and connectivity as the schematic. Hardware Studio no longer creates a hidden starter board with invented dimensions; define the board data you actually know, then place and route against that identity.</p>
            </div>
            <button type="button" onClick={() => setActiveView('board-settings')} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
              <CircuitBoard className="h-4 w-4" aria-hidden="true" /> Open Board settings
            </button>
          </div>

          {boards.length > 0 && (
            <div className="mt-6 border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-700">Existing boards</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {boards.map((board) => (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => updateView({ activeBoardId: board.id })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => setActiveView('board-settings')} className="group border border-slate-200 bg-slate-50 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><CircuitBoard className="h-4 w-4 text-indigo-600" /> Board settings</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span>
              <span className="mt-2 block text-xs leading-5 text-slate-500">Create the physical board identity and record only known dimensions, layer count, substrate, mounting, thermal, connector, and RF constraints.</span>
            </button>
            <button type="button" onClick={() => setActiveView('component-library')} className="group border border-slate-200 bg-slate-50 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><Boxes className="h-4 w-4 text-indigo-600" /> Component library</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span>
              <span className="mt-2 block text-xs leading-5 text-slate-500">Choose reviewed definitions and create canonical project component instances before PCB placement.</span>
            </button>
            <button type="button" onClick={() => setActiveView('schematic-editor')} className="group border border-slate-200 bg-slate-50 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><PenTool className="h-4 w-4 text-indigo-600" /> Schematic</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span>
              <span className="mt-2 block text-xs leading-5 text-slate-500">Place the same project components, connect pins, and create the nets that PCB layout will consume.</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 text-slate-900">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-xs">
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-600">Active board context</p>
          <p className="truncate text-xs font-bold text-slate-900">{activeBoard.name} · {activeBoardComponents.length} components · {nets.length} nets · {traces.filter((trace) => trace.boardId === activeBoard.id).length} traces</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setActiveView('component-library')} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">Add component</button>
          <button type="button" onClick={() => setActiveView('schematic-editor')} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">Open schematic</button>
          <button type="button" onClick={() => setActiveView('board-settings')} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">Board settings</button>
        </div>
      </div>

      <BoardToolbar
        viewState={viewState}
        onViewStateChange={updateView}
        drcCount={drcCount}
        onAutoPlace={handleAutoPlace}
        onRoughAutoroute={handleRoughAutoroute}
        onRunDRC={handleRunDRC}
        onGenerateBlueprint={handleGenerateBlueprint}
        onExportBoard={handleExportBoard}
        onOpenFactory={handleOpenFactory}
      />

      <div className="flex min-h-0 flex-1">
        <BoardLayerPanel viewState={viewState} onViewStateChange={updateView} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <BoardCanvas viewState={viewState} onViewStateChange={updateView} drcResults={drcResults} />
          </div>
          <BoardComponentBin viewState={viewState} onViewStateChange={updateView} onAutoPlace={handleAutoPlace} />
          <BoardStatusBar viewState={viewState} />
        </div>

        <div className="flex w-56 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-xs">
          <div className="flex shrink-0 border-b border-slate-200 bg-slate-50/50">
            {([
              { key: 'inspector' as const, label: 'Inspector', Icon: Cpu },
              { key: 'nets' as const, label: 'Nets', Icon: Network },
              { key: 'drc' as const, label: 'DRC', Icon: AlertTriangle },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRightTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${rightTab === tab.key ? 'border-b-2 border-indigo-600 bg-white font-extrabold text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <tab.Icon className="h-3 w-3" aria-hidden="true" />
                {tab.label}
                {tab.key === 'drc' && drcCount > 0 && <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[7px] font-bold text-white">{drcCount > 9 ? '9+' : drcCount}</span>}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-white">
            {rightTab === 'inspector' && <BoardInspector viewState={viewState} onViewStateChange={updateView} />}
            {rightTab === 'nets' && <BoardNetPanel viewState={viewState} onViewStateChange={updateView} />}
            {rightTab === 'drc' && <BoardDRCPanel results={drcResults} viewState={viewState} onViewStateChange={updateView} />}
          </div>
        </div>
      </div>
    </div>
  );
};
