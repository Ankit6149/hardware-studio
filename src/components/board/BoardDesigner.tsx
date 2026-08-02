'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
import { ReviewResult } from '../../types';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircuitBoard,
  Cpu,
  Network,
  PenTool,
  Plus,
} from 'lucide-react';

type RightTab = 'inspector' | 'nets' | 'drc';

export const BoardDesigner: React.FC = () => {
  const store = useProjectStore();
  const {
    boardOutlines = [],
    boardComponents = [],
    nets = [],
    traces = [],
    boards = [],
    pcbLayers = [],
    setActiveView,
    setActiveBoard,
    addBoard,
    updateProjectState,
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

  const initialBoardId = contextBoardId || store.activeBoardId || boards[0]?.id || null;
  const [viewState, setViewState] = useState<BoardDesignerUIState>({
    ...DEFAULT_VIEW_STATE,
    activeBoardId: initialBoardId,
    activeLayerId: pcbLayers[0]?.id || 'top-copper',
    selectedComponentId: contextComponentId,
    selectedNetName: contextNetName,
  });
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [drcResults, setDrcResults] = useState<ReviewResult[]>([]);

  useEffect(() => {
    const activeBoardId = contextBoardId || store.activeBoardId || boards[0]?.id || null;
    setViewState((previous) => ({
      ...previous,
      activeBoardId,
      selectedComponentId: contextComponentId ?? previous.selectedComponentId,
      selectedNetName: contextNetName ?? previous.selectedNetName,
    }));
  }, [boards, contextBoardId, contextComponentId, contextNetName, store.activeBoardId]);

  const updateView = useCallback((patch: Partial<BoardDesignerUIState>) => {
    setViewState((previous) => ({ ...previous, ...patch }));
    if (patch.activeBoardId !== undefined) {
      setContextBoard(patch.activeBoardId);
      if (patch.activeBoardId) setActiveBoard(patch.activeBoardId);
    }
    if (patch.selectedComponentId !== undefined) setContextComponent(patch.selectedComponentId);
    if (patch.selectedNetName !== undefined) setContextNet(patch.selectedNetName);
  }, [setActiveBoard, setContextBoard, setContextComponent, setContextNet]);

  const handleRunDRC = useCallback(() => {
    const project = useProjectStore.getState();
    const results = runBoardDRC(project);
    setDrcResults(results);
    setRightTab('drc');
  }, []);

  const handleAutoPlace = useCallback(() => {
    const outline = boardOutlines.find((candidate) => candidate.boardId === viewState.activeBoardId)
      || boardOutlines[0];
    const componentsForBoard = boardComponents.filter((component) => component.boardId === viewState.activeBoardId);
    const placed = autoPlaceFn(componentsForBoard, outline);
    for (const component of placed) {
      store.updateBoardComponent(component.id, {
        placementX: component.placementX,
        placementY: component.placementY,
        placementStatus: component.placementStatus,
      });
    }
    const project = useProjectStore.getState();
    const assignments = inferPadNetAssignments(project);
    store.setPadNetAssignments(assignments);
    handleRunDRC();
  }, [boardComponents, boardOutlines, handleRunDRC, store, viewState.activeBoardId]);

  const handleRoughAutoroute = useCallback(() => {
    const project = useProjectStore.getState();
    const primaryBoard = boards.find((board) => board.id === viewState.activeBoardId) || boards[0];
    const layerId = viewState.activeLayerId || 'top-copper';

    for (const net of nets) {
      const existing = traces.filter((trace) => trace.netName === net.netName && trace.boardId === primaryBoard?.id);
      if (existing.length > 0) continue;
      const trace = roughAutorouteNet(project, net.netName, layerId, primaryBoard?.id || 'board-main');
      if (trace) addTrace(trace);
    }
    handleRunDRC();
  }, [addTrace, boards, handleRunDRC, nets, traces, viewState.activeBoardId, viewState.activeLayerId]);

  const handleGenerateBlueprint = useCallback(() => {
    generateBlueprintPack();
    beginHandoff('board-designer', 'board-designer');
    setActiveView('blueprint-sheets');
  }, [beginHandoff, generateBlueprintPack, setActiveView]);

  const handleExportBoard = useCallback(() => {
    beginHandoff('board-designer', 'board-designer');
    setActiveView('exports');
  }, [beginHandoff, setActiveView]);

  const handleOpenFactory = useCallback(() => {
    beginHandoff('board-designer', 'board-designer');
    setActiveView('factory-builder');
  }, [beginHandoff, setActiveView]);

  const createStarterBoard = useCallback(() => {
    const board = addBoard({
      name: 'Main PCB',
      boardType: 'Main PCB',
      purpose: 'Primary electronics board. Replace the starter dimensions and notes with project-specific engineering data.',
      dimensionsMm: '50 x 30',
      layerCount: 2,
      substrate: 'FR4',
      placement: 'Internal',
      status: 'Concept',
    });
    const outline = {
      id: `outline_${board.id}`,
      boardId: board.id,
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 30 },
        { x: 0, y: 30 },
      ],
      width: 50,
      height: 30,
      units: 'mm' as const,
      notes: 'Starter rectangular outline. Verify exact product dimensions before placement or release.',
    };
    updateProjectState({ boardOutlines: [...boardOutlines, outline], activeBoardId: board.id });
    setActiveBoard(board.id);
    setContextBoard(board.id);
    setViewState((previous) => ({ ...previous, activeBoardId: board.id }));
  }, [addBoard, boardOutlines, setActiveBoard, setContextBoard, updateProjectState]);

  const drcCount = drcResults.filter((result) => result.severity === 'Error' || result.severity === 'Blocker').length;
  const activeBoard = boards.find((board) => board.id === viewState.activeBoardId) || boards[0];
  const activeBoardComponents = activeBoard
    ? boardComponents.filter((component) => component.boardId === activeBoard.id)
    : [];

  if (!activeBoard) {
    return (
      <section className="flex h-full min-h-0 flex-1 items-center justify-center overflow-y-auto bg-slate-50 p-4 sm:p-6" aria-labelledby="pcb-empty-title">
        <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><CircuitBoard className="h-6 w-6" aria-hidden="true" /></span>
              <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">PCB · Connected entry</p>
              <h1 id="pcb-empty-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Create or select a board before placing footprints</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">PCB layout is part of the same project as components and schematic connectivity. Start with a real board record, then bring the same component instances and nets into this editor. No dashboard generator is required.</p>
            </div>
            <button type="button" onClick={createStarterBoard} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
              <Plus className="h-4 w-4" aria-hidden="true" /> Create starter board
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => setActiveView('board-settings')} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><CircuitBoard className="h-4 w-4 text-indigo-600" /> Board settings</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span>
              <span className="mt-2 block text-xs leading-5 text-slate-500">Create a custom board, dimensions, layer count, substrate, mounting, connector, thermal, and RF notes.</span>
            </button>
            <button type="button" onClick={() => setActiveView('component-library')} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><Boxes className="h-4 w-4 text-indigo-600" /> Component library</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span>
              <span className="mt-2 block text-xs leading-5 text-slate-500">Choose reviewed definitions and create canonical project component instances before PCB placement.</span>
            </button>
            <button type="button" onClick={() => setActiveView('schematic-editor')} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-slate-900"><PenTool className="h-4 w-4 text-indigo-600" /> Schematic</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span>
              <span className="mt-2 block text-xs leading-5 text-slate-500">Place the same project components, connect pins, and create the nets that PCB layout will consume.</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-200">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-3 py-2">
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-300">Active board context</p>
          <p className="truncate text-xs font-bold text-white">{activeBoard.name} · {activeBoardComponents.length} components · {nets.length} nets · {traces.filter((trace) => trace.boardId === activeBoard.id).length} traces</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setActiveView('component-library')} className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-700">Add component</button>
          <button type="button" onClick={() => setActiveView('schematic-editor')} className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-700">Open schematic</button>
          <button type="button" onClick={() => setActiveView('board-settings')} className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-700">Board settings</button>
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

        <div className="flex w-56 shrink-0 flex-col overflow-hidden border-l border-slate-800 bg-slate-900">
          <div className="flex shrink-0 border-b border-slate-800">
            {([
              { key: 'inspector' as const, label: 'Inspector', Icon: Cpu },
              { key: 'nets' as const, label: 'Nets', Icon: Network },
              { key: 'drc' as const, label: 'DRC', Icon: AlertTriangle },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRightTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${rightTab === tab.key ? 'border-b-2 border-indigo-500 bg-slate-800 text-indigo-300' : 'text-slate-500 hover:text-slate-400'}`}
              >
                <tab.Icon className="h-3 w-3" aria-hidden="true" />
                {tab.label}
                {tab.key === 'drc' && drcCount > 0 && <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[7px] font-bold text-white">{drcCount > 9 ? '9+' : drcCount}</span>}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {rightTab === 'inspector' && <BoardInspector viewState={viewState} onViewStateChange={updateView} />}
            {rightTab === 'nets' && <BoardNetPanel viewState={viewState} onViewStateChange={updateView} />}
            {rightTab === 'drc' && <BoardDRCPanel results={drcResults} viewState={viewState} onViewStateChange={updateView} />}
          </div>
        </div>
      </div>
    </div>
  );
};
