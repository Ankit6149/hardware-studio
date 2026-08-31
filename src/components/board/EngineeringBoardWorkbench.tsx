'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CircuitBoard,
  Circle,
  Magnet,
  MousePointer2,
  Move,
  PanelRight,
  RotateCw,
  Route,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { PCB_EDITOR_LAYERS, usePcbWorkspaceUiStore } from '../../store/pcbWorkspaceUiStore';
import { BoardCanvas } from './BoardCanvas';
import { DEFAULT_VIEW_STATE, GRID_PRESETS, type BoardDesignerUIState } from './boardInteraction';
import { runBoardDRC } from '../../lib/boardDRC';
import { getFootprint } from '../../lib/footprints';
import { EditorDockButton } from '../editor/EditorDockButton';
import {
  EditorToolButton,
  EngineeringBottomDock,
  EngineeringEditorBar,
  EngineeringInspector,
  EngineeringStatusBar,
} from '../editor/EngineeringEditorShell';

function numericRuleValue(value?: string): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export const EngineeringBoardWorkbench: React.FC = () => {
  const store = useProjectStore();
  const {
    boards = [],
    boardOutlines = [],
    boardComponents = [],
    traces = [],
    vias = [],
    padNetAssignments = [],
    pcbRules = [],
    setActiveBoard,
    updatePCBPlacement,
    updateBoardComponent,
    updateTrace,
    setActiveView,
  } = store;
  const {
    activeBoardId: contextBoardId,
    activeComponentId,
    activeNetName,
    selected: sharedSelection,
    setActiveBoard: setContextBoard,
    select,
    beginHandoff,
  } = useStudioContextStore();
  const uiActiveLayerId = usePcbWorkspaceUiStore((state) => state.activeLayerId);
  const uiLayerVisibility = usePcbWorkspaceUiStore((state) => state.layerVisibility);
  const problemsRequestId = usePcbWorkspaceUiStore((state) => state.problemsRequestId);
  const setUiActiveLayer = usePcbWorkspaceUiStore((state) => state.setActiveLayer);
  const setUiLayerVisibility = usePcbWorkspaceUiStore((state) => state.setLayerVisibility);

  const initialBoardId = [contextBoardId, store.activeBoardId]
    .find((candidate): candidate is string => Boolean(candidate && boards.some((board) => board.id === candidate))) || null;

  const [viewState, setViewState] = useState<BoardDesignerUIState>({
    ...DEFAULT_VIEW_STATE,
    activeBoardId: initialBoardId,
    activeLayerId: uiActiveLayerId,
    layerVisibility: { ...uiLayerVisibility },
    showRatsnest: uiLayerVisibility.ratsnest !== false,
    selectedComponentId: activeComponentId,
    selectedNetName: activeNetName,
  });
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [problemsOpen, setProblemsOpen] = useState(false);
  const [drcResults, setDrcResults] = useState(() => runBoardDRC({ ...store, activeBoardId: initialBoardId || '' }));

  const activeBoard = boards.find((board) => board.id === viewState.activeBoardId) || null;
  const outline = boardOutlines.find((candidate) => candidate.boardId === activeBoard?.id) || null;
  const components = activeBoard ? boardComponents.filter((component) => component.boardId === activeBoard.id) : [];
  const placed = components.filter((component) => component.placementX != null && component.placementY != null);
  const boardTraces = activeBoard ? traces.filter((trace) => trace.boardId === activeBoard.id) : [];
  const widthRule = pcbRules.find((rule) => rule.boardId === activeBoard?.id && /(?:track|trace).*width/i.test(rule.ruleType));
  const configuredRouteWidth = numericRuleValue(widthRule?.value);
  const routeWidthMm = configuredRouteWidth || 0.25;

  const selectedComponent = boardComponents.find((component) => component.id === viewState.selectedComponentId) || null;
  const selectedTrace = traces.find((trace) => trace.id === viewState.selectedTraceId) || null;
  const selectedVia = vias.find((via) => via.id === viewState.selectedViaId) || null;
  const selectedFootprint = selectedComponent ? getFootprint(selectedComponent.footprint) : null;
  const selectedPad = sharedSelection?.entity === 'pcb-pad' && selectedComponent && selectedFootprint
    ? selectedFootprint.pads.find((pad) => `${selectedComponent.id}:${pad.name}` === sharedSelection.id) || null
    : null;
  const selectedPadAssignment = selectedPad && selectedComponent
    ? padNetAssignments.find((assignment) => (
      (assignment.componentId === selectedComponent.id || assignment.referenceDesignator === selectedComponent.referenceDesignator)
      && assignment.padName === selectedPad.name
    )) || null
    : null;

  useEffect(() => {
    setViewState((previous) => ({
      ...previous,
      activeLayerId: uiActiveLayerId,
      layerVisibility: { ...uiLayerVisibility },
      showRatsnest: uiLayerVisibility.ratsnest !== false,
    }));
  }, [uiActiveLayerId, uiLayerVisibility]);

  useEffect(() => {
    if (problemsRequestId > 0) setProblemsOpen(true);
  }, [problemsRequestId]);

  useEffect(() => {
    if (!sharedSelection) return;
    if (sharedSelection.boardId && activeBoard?.id && sharedSelection.boardId !== activeBoard.id) return;

    if (sharedSelection.entity === 'component-instance') {
      setViewState((previous) => ({
        ...previous,
        selectedComponentId: sharedSelection.componentId || sharedSelection.id,
        selectedTraceId: null,
        selectedViaId: null,
      }));
      setInspectorOpen(true);
      return;
    }

    if (sharedSelection.entity === 'net') {
      setViewState((previous) => ({
        ...previous,
        selectedComponentId: null,
        selectedTraceId: null,
        selectedViaId: null,
        selectedNetName: sharedSelection.netName || sharedSelection.id,
      }));
      setInspectorOpen(false);
    }
  }, [activeBoard?.id, sharedSelection]);

  const updateView = useCallback((patch: Partial<BoardDesignerUIState>) => {
    setViewState((previous) => ({ ...previous, ...patch }));

    if (patch.activeLayerId !== undefined) setUiActiveLayer(patch.activeLayerId);
    if (patch.layerVisibility !== undefined) setUiLayerVisibility(patch.layerVisibility);

    if (patch.activeBoardId !== undefined) {
      setContextBoard(patch.activeBoardId);
      setActiveBoard(patch.activeBoardId || '');
    }

    const latestProject = useProjectStore.getState();
    const latestContext = useStudioContextStore.getState();
    const boardIdForSelection = patch.activeBoardId ?? latestContext.activeBoardId ?? latestProject.activeBoardId ?? null;

    if (patch.selectedTraceId) {
      const trace = (latestProject.traces || []).find((candidate) => candidate.id === patch.selectedTraceId);
      const parentComponentId = trace?.sourceAnchor?.componentId || trace?.targetAnchor?.componentId || undefined;
      const netName = trace?.netName || (trace?.netId ? (latestProject.nets || []).find((net) => net.id === trace.netId)?.netName : undefined) || null;
      select({
        entity: 'trace',
        id: patch.selectedTraceId,
        label: netName || patch.selectedTraceId,
        boardId: trace?.boardId || boardIdForSelection,
        componentId: parentComponentId,
        netName,
      });
      setInspectorOpen(true);
      return;
    }

    if (patch.selectedViaId) {
      const via = (latestProject.vias || []).find((candidate) => candidate.id === patch.selectedViaId);
      const netName = via?.netName || (via?.netId ? (latestProject.nets || []).find((net) => net.id === via.netId)?.netName : undefined) || null;
      select({
        entity: 'via',
        id: patch.selectedViaId,
        label: netName ? `Via · ${netName}` : 'Via',
        boardId: via?.boardId || boardIdForSelection,
        netName,
      });
      setInspectorOpen(true);
      return;
    }

    if (patch.selectedComponentId) {
      const component = (latestProject.boardComponents || []).find((candidate) => candidate.id === patch.selectedComponentId);
      select({
        entity: 'component-instance',
        id: patch.selectedComponentId,
        label: component?.referenceDesignator || patch.selectedComponentId,
        boardId: component?.boardId || boardIdForSelection,
        componentId: patch.selectedComponentId,
        netName: patch.selectedNetName !== undefined ? patch.selectedNetName : undefined,
      });
      setInspectorOpen(true);
      return;
    }

    if (patch.selectedNetName) {
      select({
        entity: 'net',
        id: patch.selectedNetName,
        label: patch.selectedNetName,
        boardId: boardIdForSelection,
        netName: patch.selectedNetName,
      });
      return;
    }

    if (
      patch.selectedComponentId === null
      || patch.selectedTraceId === null
      || patch.selectedViaId === null
      || patch.selectedNetName === null
    ) {
      select(null);
    }
  }, [select, setActiveBoard, setContextBoard, setUiActiveLayer, setUiLayerVisibility]);

  const selectComponent = useCallback((componentId: string) => {
    updateView({
      selectedComponentId: componentId,
      selectedTraceId: null,
      selectedViaId: null,
      selectedDrillHoleId: null,
      selectedKeepoutId: null,
      activeTool: 'select',
    });
    setInspectorOpen(true);
  }, [updateView]);

  const selectPad = useCallback((componentId: string, padName: string) => {
    const component = boardComponents.find((candidate) => candidate.id === componentId);
    if (!component) return;
    const assignment = padNetAssignments.find((candidate) => (
      (candidate.componentId === component.id || candidate.referenceDesignator === component.referenceDesignator)
      && candidate.padName === padName
    ));
    setViewState((previous) => ({
      ...previous,
      selectedComponentId: component.id,
      selectedTraceId: null,
      selectedViaId: null,
      selectedNetName: assignment?.netName || null,
    }));
    select({
      entity: 'pcb-pad',
      id: `${component.id}:${padName}`,
      label: `${component.referenceDesignator}.${padName}`,
      boardId: component.boardId,
      componentId: component.id,
      netName: assignment?.netName || null,
    });
    setInspectorOpen(true);
  }, [boardComponents, padNetAssignments, select]);

  const runDrc = () => {
    const results = runBoardDRC({ ...useProjectStore.getState(), activeBoardId: viewState.activeBoardId || '' });
    setDrcResults(results);
    setProblemsOpen(true);
  };

  const rotateSelected = () => {
    if (!selectedComponent) return;
    updatePCBPlacement(selectedComponent.id, { rotationDeg: ((selectedComponent.rotationDeg || 0) + 90) % 360 });
  };

  const openSchematic = () => {
    beginHandoff('board-designer', 'board-designer');
    setActiveView('schematic-editor');
  };

  if (!activeBoard) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-[#f7f5ef]">
        <EngineeringEditorBar
          domain="Electronics"
          title="PCB Layout"
          meta="No board selected"
          actions={<button type="button" onClick={() => setActiveView('board-settings')} className="h-8 bg-slate-950 px-3 text-[10px] font-semibold text-white">Board settings</button>}
        />
        <div className="grid min-h-0 flex-1 place-items-center bg-white p-6">
          <div className="max-w-lg text-center">
            <CircuitBoard className="mx-auto h-8 w-8 text-slate-300" />
            <h1 className="mt-3 text-base font-semibold text-slate-950">Create or select a board before layout</h1>
            <p className="mt-1 text-xs leading-5 text-slate-500">PCB placement and routing require a real board identity. Hardware Studio will not invent one.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!outline) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-[#f7f5ef]">
        <EngineeringEditorBar
          domain="Electronics"
          title="PCB Layout"
          meta={`${activeBoard.name} · outline unresolved`}
          actions={<button type="button" onClick={() => setActiveView('board-settings')} className="h-8 bg-slate-950 px-3 text-[10px] font-semibold text-white">Define outline</button>}
        />
        <div className="grid min-h-0 flex-1 place-items-center bg-white p-6">
          <div className="max-w-lg text-center">
            <CircuitBoard className="mx-auto h-8 w-8 text-slate-300" />
            <h1 className="mt-3 text-base font-semibold text-slate-950">Define the board outline first</h1>
            <p className="mt-1 text-xs leading-5 text-slate-500">The editing canvas stays blocked until the board has explicit physical geometry. No hidden fallback is used as design truth.</p>
          </div>
        </div>
      </section>
    );
  }

  const hardDrcCount = drcResults.filter((result) => result.severity === 'Blocker' || result.severity === 'Error').length;
  const routableLayers = PCB_EDITOR_LAYERS.filter((layer) => layer.routable);

  return (
    <section className="hs-engineering-pcb flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5ef] text-slate-900" aria-label="PCB engineering workbench">
      <EngineeringEditorBar
        domain="Electronics"
        title="PCB Layout"
        meta={`${activeBoard.name} · ${placed.length}/${components.length} placed · ${boardTraces.length} traces · ${hardDrcCount} DRC errors`}
        tools={(
          <>
            <EditorToolButton label="Select" active={viewState.activeTool === 'select'} onClick={() => updateView({ activeTool: 'select', isRouting: false, routePreviewPoints: [] })}><MousePointer2 className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Pan" active={viewState.activeTool === 'pan'} onClick={() => updateView({ activeTool: 'pan', isRouting: false, routePreviewPoints: [] })}><Move className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Route" active={viewState.activeTool === 'route'} onClick={() => updateView({ activeTool: 'route' })}><Route className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Via" active={viewState.activeTool === 'via'} disabled={!viewState.selectedNetName} onClick={() => updateView({ activeTool: 'via' })}><Circle className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Rotate" disabled={!selectedComponent} onClick={rotateSelected}><RotateCw className="h-3.5 w-3.5" /></EditorToolButton>
            <span className="mx-1 h-5 w-px bg-slate-200" />
            <select value={viewState.activeLayerId} onChange={(event) => updateView({ activeLayerId: event.target.value })} className="h-7 border border-slate-300 bg-white px-1.5 font-mono text-[9px] text-slate-700" aria-label="Active PCB routing layer">
              {routableLayers.map((layer) => <option key={layer.id} value={layer.id}>{layer.label}</option>)}
            </select>
            <select value={viewState.gridSizeMm} onChange={(event) => updateView({ gridSizeMm: Number.parseFloat(event.target.value) })} className="h-7 border border-slate-300 bg-white px-1.5 font-mono text-[9px] text-slate-700" aria-label="PCB grid size">
              {GRID_PRESETS.map((grid) => <option key={grid} value={grid}>{grid} mm</option>)}
            </select>
            <button type="button" onClick={() => updateView({ snapToGrid: !viewState.snapToGrid })} aria-pressed={viewState.snapToGrid} className={`inline-flex h-7 items-center gap-1 px-2 text-[9px] font-semibold ${viewState.snapToGrid ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-600'}`}><Magnet className="h-3 w-3" /> Snap</button>
          </>
        )}
        docks={(
          <>
            <EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} onClick={() => setInspectorOpen((value) => !value)} />
            <EditorDockButton label="Problems" icon={AlertTriangle} active={problemsOpen} count={hardDrcCount} onClick={() => setProblemsOpen((value) => !value)} />
          </>
        )}
        actions={(
          <>
            <button type="button" onClick={runDrc} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><AlertTriangle className="h-3.5 w-3.5" /> DRC</button>
            <button type="button" onClick={openSchematic} className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-2.5 text-[10px] font-semibold text-white hover:bg-slate-800">Schematic <ArrowRight className="h-3 w-3" /></button>
          </>
        )}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <BoardCanvas viewState={viewState} onViewStateChange={updateView} drcResults={drcResults} />

        <EngineeringInspector open={inspectorOpen} subtitle={selectedPad ? `${selectedComponent?.referenceDesignator}.${selectedPad.name}` : selectedTrace ? `Trace · ${selectedTrace.netName || 'unassigned'}` : selectedVia ? 'Via' : selectedComponent ? selectedComponent.referenceDesignator : 'Selection'} onClose={() => setInspectorOpen(false)} widthClassName="w-[320px]">
          <div className="p-3">
            {selectedComponent ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Footprint</p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-950">{selectedComponent.referenceDesignator} · {selectedComponent.componentName}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-500">{selectedComponent.footprint || 'footprint unresolved'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[9px] text-slate-500">X mm<input type="number" step={viewState.gridSizeMm} value={selectedComponent.placementX ?? ''} onChange={(event) => updatePCBPlacement(selectedComponent.id, { placementX: Number.parseFloat(event.target.value) })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label>
                  <label className="text-[9px] text-slate-500">Y mm<input type="number" step={viewState.gridSizeMm} value={selectedComponent.placementY ?? ''} onChange={(event) => updatePCBPlacement(selectedComponent.id, { placementY: Number.parseFloat(event.target.value) })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label>
                </div>
                <label className="block text-[9px] text-slate-500">Rotation<input type="number" value={selectedComponent.rotationDeg || 0} onChange={(event) => updatePCBPlacement(selectedComponent.id, { rotationDeg: Number.parseFloat(event.target.value) || 0 })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label>
                <div className="grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 text-[9px]">
                  {[
                    ['Side', selectedComponent.pcb?.side || selectedComponent.side || 'Unresolved'],
                    ['Pads', String(selectedFootprint?.pads.length || 0)],
                    ['Criticality', selectedComponent.placementCriticality],
                    ['Status', selectedComponent.placementStatus || (selectedComponent.pcb?.placed ? 'Placed' : 'Unplaced')],
                  ].map(([label, value]) => <div key={label} className="bg-white p-2"><p className="text-slate-400">{label}</p><p className="mt-0.5 truncate font-semibold text-slate-800">{value}</p></div>)}
                </div>
                {selectedFootprint && selectedFootprint.pads.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Pads · select to cross-probe</p>
                    <div className="max-h-44 overflow-y-auto border-y border-slate-200">
                      {selectedFootprint.pads.map((pad) => {
                        const assignment = padNetAssignments.find((candidate) => (
                          (candidate.componentId === selectedComponent.id || candidate.referenceDesignator === selectedComponent.referenceDesignator)
                          && candidate.padName === pad.name
                        ));
                        const active = selectedPad?.name === pad.name;
                        return (
                          <button key={pad.name} type="button" onClick={() => selectPad(selectedComponent.id, pad.name)} className={`grid w-full grid-cols-[3rem_minmax(0,1fr)_5.5rem] gap-2 border-b border-slate-100 px-1 py-1.5 text-left text-[9px] last:border-b-0 ${active ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                            <span className={`font-mono ${active ? 'font-bold text-indigo-700' : 'text-slate-500'}`}>{pad.name}</span>
                            <span className="truncate text-slate-600">{pad.widthMm.toFixed(2)} × {pad.heightMm.toFixed(2)} mm</span>
                            <span className={`truncate text-right ${assignment?.netName ? 'text-slate-600' : 'text-slate-400'}`}>{assignment?.netName || 'unassigned'}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedPad && (
                      <div className="mt-2 border-l-2 border-indigo-500 bg-indigo-50 px-2 py-1.5 text-[9px] leading-4 text-indigo-900">
                        <strong>Pad {selectedPad.name}</strong> · {selectedPadAssignment?.netName ? `net ${selectedPadAssignment.netName}` : 'no project net assignment'}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-1">
                  <button type="button" onClick={rotateSelected} className="h-8 flex-1 border border-slate-300 bg-white text-[9px] font-semibold text-slate-700">Rotate 90°</button>
                  <button type="button" onClick={() => updateBoardComponent(selectedComponent.id, { side: selectedComponent.side === 'Bottom' ? 'Top' : 'Bottom' })} className="h-8 flex-1 border border-slate-300 bg-white text-[9px] font-semibold text-slate-700">Flip side</button>
                </div>
              </div>
            ) : selectedTrace ? (
              <div className="space-y-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Trace</p>
                <p className="text-[12px] font-semibold text-slate-950">{selectedTrace.netName || 'Unnamed net'}</p>
                <label className="block text-[9px] text-slate-500">Width mm<input type="number" step="0.05" value={selectedTrace.width || 0.25} onChange={(event) => updateTrace(selectedTrace.id, { width: Number.parseFloat(event.target.value) || 0.25 })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label>
                <p className="text-[9px] text-slate-500">{selectedTrace.layerId || 'top-copper'} · {selectedTrace.points?.length || 0} vertices · {selectedTrace.status || 'Draft'} · shared trace {selectedTrace.id}</p>
              </div>
            ) : selectedVia ? (
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Via</p>
                <p className="mt-1 font-mono text-[10px] text-slate-700">{selectedVia.x?.toFixed(2)}, {selectedVia.y?.toFixed(2)} mm</p>
                <p className="mt-2 text-[9px] text-slate-500">Ø {selectedVia.outerDiameter || 0.6} / drill {selectedVia.drillDiameter || 0.3} mm · {sharedSelection?.entity === 'via' && sharedSelection.netName ? `net ${sharedSelection.netName}` : 'net unresolved'}</p>
              </div>
            ) : (
              <p className="text-[10px] leading-5 text-slate-500">Select a footprint, pad, trace, or via. Nets and board structure stay in the Project Drawer; this Inspector is only for the immediate object.</p>
            )}
          </div>
        </EngineeringInspector>

        <EngineeringBottomDock
          open={problemsOpen}
          title="PCB DRC"
          subtitle={`${hardDrcCount} blocking · ${drcResults.length} total current findings`}
          onClose={() => setProblemsOpen(false)}
          actions={<button type="button" onClick={runDrc} className="h-7 border border-slate-300 bg-white px-2 text-[9px] font-semibold text-slate-700">Run again</button>}
          heightClassName="h-[196px]"
        >
          <div className="grid gap-1 p-2 sm:grid-cols-2 xl:grid-cols-3">
            {drcResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => {
                  if (result.linkedObjectType === 'component') selectComponent(result.linkedObjectId);
                  if (result.linkedObjectType === 'net') {
                    select({ entity: 'net', id: result.linkedObjectId, label: result.linkedObjectId, boardId: activeBoard.id, netName: result.linkedObjectId });
                    setViewState((previous) => ({ ...previous, selectedComponentId: null, selectedTraceId: null, selectedViaId: null, selectedNetName: result.linkedObjectId }));
                    setInspectorOpen(false);
                  }
                }}
                className="border-l-2 border-amber-500 bg-amber-50 px-2 py-1.5 text-left"
              >
                <p className="text-[9px] font-semibold text-amber-950">{result.severity} · {result.title}</p>
                <p className="mt-0.5 text-[9px] leading-4 text-amber-800">{result.description}</p>
              </button>
            ))}
            {drcResults.length === 0 && <p className="p-3 text-[9px] text-emerald-700">No current DRC findings.</p>}
          </div>
        </EngineeringBottomDock>
      </div>

      <EngineeringStatusBar
        left={viewState.isRouting ? `Routing ${viewState.selectedNetName || 'net'} · click to fix segments · finish on matching anchor · Esc cancels` : viewState.activeTool === 'route' ? 'Route: choose a net in the Project Drawer, then start from a matching pad/via/trace endpoint.' : 'Select and move footprints directly. Drag unplaced components from the Project Drawer.'}
        center={selectedPad ? `${selectedComponent?.referenceDesignator}.${selectedPad.name} · ${selectedPadAssignment?.netName || 'unassigned'}` : selectedTrace ? `Trace · ${selectedTrace.netName || 'unassigned'}` : selectedVia ? `Via · ${sharedSelection?.netName || 'net unresolved'}` : `${viewState.activeLayerId} · ${configuredRouteWidth ? `configured width ${routeWidthMm.toFixed(2)} mm` : 'no explicit trace-width rule; new routes remain draft evidence'}`}
        right={`${viewState.mouseXMm.toFixed(2)}, ${viewState.mouseYMm.toFixed(2)} mm`}
      />
    </section>
  );
};
