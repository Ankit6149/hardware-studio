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
  Layers,
  Network,
  PanelRight,
} from 'lucide-react';
import { useFeedback } from '../feedback/FeedbackProvider';
import { EditorDockButton } from '../editor/EditorDockButton';

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
  const [layersOpen, setLayersOpen] = useState(false);
  const [rightDockOpen, setRightDockOpen] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(false);

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
    setRightDockOpen(true);
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
        detail: 'Auto placement needs the selected board’s real outline. Hardware Studio will not place components inside a hidden fallback.',
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
  const activeBoardTraceCount = activeBoard ? traces.filter((trace) => trace.boardId === activeBoard.id).length : 0;

  if (!activeBoard) {
    return (
      <section className="flex h-full min-h-0 flex-1 items-center justify-center overflow-y-auto bg-slate-50 p-4 sm:p-6" aria-labelledby="pcb-empty-title">
        <div className="w-full max-w-3xl rounded-lg border border-slate-300 bg-white p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <span className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-slate-50 text-slate-700"><CircuitBoard className="h-5 w-5" aria-hidden="true" /></span>
              <h1 id="pcb-empty-title" className="mt-4 text-xl font-semibold tracking-tight text-slate-950">PCB layout needs an explicit board</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">The editor will not invent a board, outline, dimensions, or physical placement. Create or select the board identity first; the PCB canvas then consumes the same canonical project components and nets as the schematic.</p>
            </div>
            <button type="button" onClick={() => setActiveView('board-settings')} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
              Open Board settings<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {boards.length > 0 && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="text-[11px] font-semibold text-slate-700">Existing board identities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {boards.map((board) => (
                  <div key={board.id} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1.5">
                    <span className="text-[11px] font-medium text-slate-700">{board.name}</span>
                    <button type="button" onClick={() => updateView({ activeBoardId: board.id })} className="min-h-7 rounded-md bg-slate-950 px-2 text-[9px] font-semibold text-white hover:bg-slate-800">Use board</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-500">
            <span>Need parts or connectivity first?</span>
            <button type="button" onClick={() => setActiveView('component-library')} className="font-semibold text-slate-800 underline underline-offset-2">Component library</button>
            <span>or</span>
            <button type="button" onClick={() => setActiveView('schematic-editor')} className="font-semibold text-slate-800 underline underline-offset-2">Schematic</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900" aria-label="PCB layout editor">
      <div className="flex min-h-10 shrink-0 items-center gap-2 border-b border-slate-300 bg-white px-3 py-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-slate-900">{activeBoard.name}</p>
          <p className="truncate text-[9px] text-slate-500">{activeBoardComponents.length} components · {nets.length} nets · {activeBoardTraceCount} traces</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <EditorDockButton label="Layers" icon={Layers} active={layersOpen} onClick={() => setLayersOpen((value) => !value)} />
          <EditorDockButton label="Components" icon={Boxes} active={componentsOpen} count={activeBoardComponents.filter((component) => component.placementX == null || component.placementY == null).length} onClick={() => setComponentsOpen((value) => !value)} />
          <EditorDockButton label="Inspect" icon={PanelRight} active={rightDockOpen} count={drcCount} onClick={() => setRightDockOpen((value) => !value)} />
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

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <BoardCanvas viewState={viewState} onViewStateChange={updateView} drcResults={drcResults} />

        {layersOpen && (
          <div className="absolute bottom-3 left-3 top-3 z-30 flex overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl" aria-label="PCB layers panel">
            <BoardLayerPanel viewState={viewState} onViewStateChange={updateView} />
          </div>
        )}

        {rightDockOpen && (
          <aside className="absolute bottom-3 right-3 top-3 z-30 flex w-64 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl" aria-label="PCB inspector">
            <div className="flex shrink-0 border-b border-slate-200 bg-slate-50">
              {([
                { key: 'inspector' as const, label: 'Inspector', Icon: Cpu },
                { key: 'nets' as const, label: 'Nets', Icon: Network },
                { key: 'drc' as const, label: 'DRC', Icon: AlertTriangle },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRightTab(tab.key)}
                  aria-pressed={rightTab === tab.key}
                  className={`flex min-h-9 flex-1 items-center justify-center gap-1 border-b-2 text-[10px] font-semibold ${rightTab === tab.key ? 'border-slate-950 bg-white text-slate-950' : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  <tab.Icon className="h-3 w-3" aria-hidden="true" /> {tab.label}
                  {tab.key === 'drc' && drcCount > 0 && <span className="rounded bg-red-100 px-1 text-[8px] text-red-700">{drcCount}</span>}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
              {rightTab === 'inspector' && <BoardInspector viewState={viewState} onViewStateChange={updateView} />}
              {rightTab === 'nets' && <BoardNetPanel viewState={viewState} onViewStateChange={updateView} />}
              {rightTab === 'drc' && <BoardDRCPanel results={drcResults} viewState={viewState} onViewStateChange={updateView} />}
            </div>
          </aside>
        )}

        {componentsOpen && (
          <div className="absolute bottom-3 left-1/2 z-40 w-[min(900px,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-slate-700 shadow-xl" aria-label="PCB component placement panel">
            <BoardComponentBin viewState={viewState} onViewStateChange={updateView} onAutoPlace={handleAutoPlace} />
          </div>
        )}
      </div>

      <BoardStatusBar viewState={viewState} />
    </section>
  );
};